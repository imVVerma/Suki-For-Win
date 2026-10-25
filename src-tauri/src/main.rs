// Prevents an extra console window from popping up on Windows in release builds!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod db;
mod groq;
mod injector;

use std::sync::Mutex;
use tauri::{Emitter, Manager, State, WebviewWindow};

#[cfg(target_os = "windows")]
use windows::Win32::Foundation::HWND;
#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowLongW, GetWindowTextW, SetWindowLongW, GWL_EXSTYLE,
    WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
};

/// Global in-memory storage for the user's Groq API key
pub struct ApiKeyStore(pub Mutex<String>);

/// Makes the Floating HUD never steal focus from VS Code / Browser when shown
#[cfg(target_os = "windows")]
fn make_window_non_activating(window: &WebviewWindow) {
    if let Ok(hwnd_raw) = window.hwnd() {
        let hwnd = HWND(hwnd_raw.0 as _);
        unsafe {
            let ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE);
            SetWindowLongW(
                hwnd,
                GWL_EXSTYLE,
                ex_style | (WS_EX_NOACTIVATE.0 as i32) | (WS_EX_TOOLWINDOW.0 as i32),
            );
        }
    }
}

/// Reads the currently focused window title (e.g. "main.rs - Suki-Win - Visual Studio Code")
#[tauri::command]
fn get_active_window_context() -> String {
    #[cfg(target_os = "windows")]
    unsafe {
        let hwnd = GetForegroundWindow();
        let mut buf = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut buf);
        if len > 0 {
            return String::from_utf16_lossy(&buf[..len as usize]);
        }
    }
    "Unknown Window".to_string()
}

#[tauri::command]
fn set_api_key(store: State<'_, ApiKeyStore>, key: String) -> Result<(), String> {
    let mut guard = store.0.lock().map_err(|e| e.to_string())?;
    *guard = key.trim().to_string();
    Ok(())
}

#[tauri::command]
fn get_api_key(store: State<'_, ApiKeyStore>) -> Result<String, String> {
    let guard = store.0.lock().map_err(|e| e.to_string())?;
    Ok(guard.clone())
}

#[tauri::command]
fn is_recording(recorder: State<'_, audio::AudioRecorder>) -> bool {
    recorder.is_recording()
}

#[tauri::command]
fn start_recording(
    app: tauri::AppHandle,
    recorder: State<'_, audio::AudioRecorder>,
) -> Result<(), String> {
    if let Some(hud) = app.get_webview_window("hud") {
        let _ = hud.show();
    }
    let _ = app.emit("hud-state", serde_json::json!({ "mode": "recording" }));
    recorder.start()
}

#[tauri::command]
fn cancel_recording(
    app: tauri::AppHandle,
    recorder: State<'_, audio::AudioRecorder>,
) -> Result<(), String> {
    let _ = recorder.cancel();
    if let Some(hud) = app.get_webview_window("hud") {
        let _ = hud.hide();
    }
    let _ = app.emit("hud-state", serde_json::json!({ "mode": "idle" }));
    Ok(())
}

#[tauri::command]
async fn stop_and_transcribe(
    app: tauri::AppHandle,
    recorder: State<'_, audio::AudioRecorder>,
    db: State<'_, Mutex<rusqlite::Connection>>,
    key_store: State<'_, ApiKeyStore>,
    api_key: Option<String>,
) -> Result<db::DictationEntry, String> {
    // 1. Resolve API key from argument or stored state
    let effective_key = match api_key.filter(|k| !k.trim().is_empty()) {
        Some(k) => k,
        None => {
            let guard = key_store.0.lock().map_err(|e| e.to_string())?;
            guard.clone()
        }
    };

    if effective_key.trim().is_empty() {
        let _ = app.emit("hud-state", serde_json::json!({ "mode": "error" }));
        return Err("Please enter your Groq API key in Settings first.".to_string());
    }

    // 2. Grab the active window title BEFORE anything changes
    let active_app = get_active_window_context();

    // 3. Notify HUD to show processing spinner
    let _ = app.emit("hud-state", serde_json::json!({ "mode": "processing" }));

    // 4. Stop audio capture and get in-memory 16kHz WAV bytes
    let (wav_bytes, duration_sec) = recorder.stop().map_err(|e| {
        let _ = app.emit("hud-state", serde_json::json!({ "mode": "error" }));
        e
    })?;

    // 5. Transcribe with Whisper-Large-V3-Turbo & Polish with Llama
    let raw_text = match groq::transcribe_wav_bytes(&effective_key, wav_bytes).await {
        Ok(t) => t,
        Err(e) => {
            let _ = app.emit("hud-state", serde_json::json!({ "mode": "error" }));
            return Err(e);
        }
    };

    let polished_text = groq::polish_transcript(&effective_key, &raw_text, &active_app)
        .await
        .unwrap_or_else(|_| raw_text.clone());

    // 6. Hide HUD and inject text directly into the active window
    if let Some(hud) = app.get_webview_window("hud") {
        let _ = hud.hide();
    }
    let _ = app.emit("hud-state", serde_json::json!({ "mode": "idle" }));
    let _ = injector::inject_text_at_cursor(&polished_text);

    // 7. Save to %APPDATA% SQLite history
    db::insert_dictation(
        db,
        raw_text.clone(),
        polished_text.clone(),
        active_app.clone(),
        duration_sec,
    )?;

    // 8. Notify Dashboard to refresh timeline
    let _ = app.emit("dictation-added", ());

    let word_count = polished_text.split_whitespace().count() as i64;
    Ok(db::DictationEntry {
        id: 0,
        timestamp: "Just now".to_string(),
        raw_text,
        polished_text,
        active_app,
        duration_sec,
        word_count,
    })
}

#[tauri::command]
async fn generate_daily_digest_cmd(
    key_store: State<'_, ApiKeyStore>,
    api_key: Option<String>,
    joined_logs: String,
) -> Result<String, String> {
    let effective_key = match api_key.filter(|k| !k.trim().is_empty()) {
        Some(k) => k,
        None => {
            let guard = key_store.0.lock().map_err(|e| e.to_string())?;
            guard.clone()
        }
    };

    if effective_key.trim().is_empty() {
        return Err("Please enter your Groq API key in Settings first.".to_string());
    }

    groq::generate_daily_insights(&effective_key, &joined_logs).await
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        // 1. BULLETPROOF GUARD: Prevents multiple .exe instances from ever spawning
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(main_win) = app.get_webview_window("main") {
                let _ = main_win.show();
                let _ = main_win.set_focus();
            }
        }))
        // 2. Global Shortcut Plugin for push-to-talk / toggle dictation hotkey
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // 3. Keep Suki alive in the background when the main window is closed
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            // 4. Initialize SQLite strictly inside %APPDATA%\Suki\
            let app_data = std::env::var_os("APPDATA")
                .map(std::path::PathBuf::from)
                .unwrap_or_else(|| {
                    app.path()
                        .app_data_dir()
                        .unwrap_or_else(|_| std::path::PathBuf::from("."))
                });
            let data_dir = app_data.join("Suki");
            std::fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("suki_history.db");
            let conn = db::init_db(&db_path).expect("Failed to initialize SQLite database");
            app.manage(Mutex::new(conn));

            // 5. Initialize in-memory audio engine & API key store
            app.manage(audio::AudioRecorder::new());
            app.manage(ApiKeyStore(Mutex::new(String::new())));

            // 6. Apply Win32 non-activating styles to the HUD overlay & position bottom-center
            if let Some(hud_window) = app.get_webview_window("hud") {
                #[cfg(target_os = "windows")]
                make_window_non_activating(&hud_window);

                if let Ok(Some(monitor)) = hud_window.primary_monitor() {
                    let screen_size = monitor.size();
                    let hud_w = 260;
                    let x = (screen_size.width as i32 - hud_w) / 2;
                    let y = screen_size.height as i32 - 100;
                    let _ = hud_window
                        .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_active_window_context,
            set_api_key,
            get_api_key,
            is_recording,
            start_recording,
            cancel_recording,
            stop_and_transcribe,
            generate_daily_digest_cmd,
            quit_app,
            db::get_recent_dictations,
            db::get_today_dictations,
            db::insert_dictation
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Suki-Win");
}

# Project: Suki-Win (Windows Native Voice Workflow & Dictation Engine)

## Product boundaries

- Keep audio capture in memory. Do not write recordings to disk unless the user explicitly exports them.
- Store application data only under `%APPDATA%\Suki`.
- Keep the HUD lightweight, transparent, always on top, and non-activating on Windows.
- Keep the dashboard as the primary, interactive window.
- Never send notes or recordings to an AI provider without an explicit user action.
- The user supplies their own OpenAI-compatible API key. Explain where settings are stored and surface provider errors.

## Implementation guidelines

- Keep UI and native responsibilities separated: React handles presentation; Rust handles capture, persistence, and provider requests.
- Surface errors to the user; do not silently substitute defaults after failed native operations.
- Do not add external audio executables or persist raw audio.
- Keep changes focused and update relevant tests or documentation with behavior changes.

## Architecture Overview
A Windows port of the macOS `Suki` app built with **Tauri v2 (Rust)** and **React + Vite + Tailwind CSS**.
It operates two windows from a single process:
1. `main`: The Settings, Dictation History, and AI Insights Dashboard.
2. `hud`: A 220x48px frameless, transparent, always-on-top floating pill at the bottom of the screen.

## CRITICAL GUARDRAILS FOR AGENT (DO NOT VIOLATE)
1. **NO Subprocess Spawning (`std::process::Command` is BANNED):**
   - Never call external CLI tools like `ffmpeg.exe` or `sox.exe`. All audio capture must stay in-memory via Rust `cpal` and `hound` encoded directly into a `Cursor<Vec<u8>>` WAV buffer.
2. **Single-Instance Only:**
   - Do not remove `tauri_plugin_single_instance` in `src-tauri/src/main.rs`. This guarantees the `.exe` can never enter an infinite spawn loop.
3. **Strict `%APPDATA%` File I/O:**
   - Never write files, logs, or SQLite databases to relative paths (`./` or current working directory). Always resolve paths through `app.path().app_data_dir()`.
4. **Non-Activating HUD (`WS_EX_NOACTIVATE`):**
   - The `hud` window must NEVER steal focus from the user's active window (e.g., VS Code or browser) when shown. Always keep the Win32 `WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW` extended window style intact in `main.rs`.

## Next Tasks for Antigravity to Implement
- [x] **Step 1:** Implement `src-tauri/src/groq.rs` using `reqwest` multipart upload to send the in-memory WAV buffer from `audio.rs` to `https://api.groq.com/openai/v1/audio/transcriptions` (`whisper-large-v3-turbo`), followed by a cleanup pass using `llama-3.3-70b-versatile`.
- [x] **Step 2:** Capture the active foreground window title via `GetForegroundWindow` + `GetWindowTextW` before pasting so it is logged in SQLite (`active_app`) and passed to the LLM prompt for context-aware formatting.
- [x] **Step 3:** Wire up the "Generate Daily Digest" button in `Dashboard.tsx` to query today's rows from `suki_history.db` and summarize key themes, action items, and WPM metrics.
use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use std::thread;
use std::time::Duration;

/// Injects polished text directly into the focused window by backing up clipboard,
/// pasting text via synthetic Ctrl+V, and restoring the original clipboard content.
pub fn inject_text_at_cursor(text: &str) -> Result<(), String> {
    if text.is_empty() {
        return Ok(());
    }

    let mut clipboard = Clipboard::new().map_err(|e| format!("Clipboard error: {e}"))?;

    // 1. Back up the user's current clipboard text (if any)
    let previous_clipboard = clipboard.get_text().ok();

    // 2. Place polished dictation into clipboard
    clipboard
        .set_text(text.to_string())
        .map_err(|e| format!("Clipboard write error: {e}"))?;

    // Small settle delay for Windows clipboard manager
    thread::sleep(Duration::from_millis(25));

    // 3. Synthesize Ctrl + V into the currently focused window
    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Keyboard simulator error: {e}"))?;
    let _ = enigo.key(Key::Control, Direction::Press);
    let _ = enigo.key(Key::Unicode('v'), Direction::Click);
    let _ = enigo.key(Key::Control, Direction::Release);

    // 4. Wait 60ms for target app (VS Code, browser, etc.) to process paste, then restore old clipboard
    thread::sleep(Duration::from_millis(60));
    if let Some(old_text) = previous_clipboard {
        let _ = clipboard.set_text(old_text);
    }

    Ok(())
}

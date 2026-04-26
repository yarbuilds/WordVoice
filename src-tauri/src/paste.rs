fn trigger_paste() -> Result<(), String> {
    // Small delay to ensure clipboard is set
    std::thread::sleep(std::time::Duration::from_millis(50));

    // Simulate Cmd+V via osascript (works from any thread, unlike enigo which
    // calls TSMGetInputSourceProperty requiring the main thread)
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .args([
                "-e",
                r#"tell application "System Events" to keystroke "v" using command down"#,
            ])
            .output()
            .map_err(|e| format!("Failed to simulate paste: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "Failed to simulate paste: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ));
        }
    }

    #[cfg(target_os = "windows")]
    {
        use enigo::{Direction, Enigo, Key, Keyboard, Settings};
        let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
        enigo
            .key(Key::Control, Direction::Press)
            .map_err(|e| e.to_string())?;
        enigo
            .key(Key::Unicode('v'), Direction::Click)
            .map_err(|e| e.to_string())?;
        enigo
            .key(Key::Control, Direction::Release)
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn copy_text(text: &str) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())
}

pub fn paste_text(text: &str, keep_in_clipboard: bool) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;
    let previous_text = if keep_in_clipboard {
        None
    } else {
        clipboard.get_text().ok()
    };

    copy_text(text)?;
    trigger_paste()?;

    if let Some(previous_text) = previous_text {
        std::thread::sleep(std::time::Duration::from_millis(250));
        clipboard
            .set_text(previous_text)
            .map_err(|e| format!("Failed to restore clipboard: {}", e))?;
    }

    Ok(())
}

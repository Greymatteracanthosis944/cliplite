use arboard::Clipboard;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use std::time::Duration;
use tokio::sync::mpsc;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClipboardContent {
    pub text: String,
    pub content_type: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClipboardEvent {
    pub content: Option<ClipboardContent>,
}

/// Starts clipboard monitoring in a background task.
/// Sends new clipboard content through the channel whenever it changes.
pub fn start_monitoring(
    tx: mpsc::UnboundedSender<ClipboardEvent>,
    running: Arc<AtomicBool>,
) {
    std::thread::spawn(move || {
        let mut clipboard = match Clipboard::new() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("Failed to initialize clipboard: {}", e);
                return;
            }
        };

        let mut last_text = String::new();

        while running.load(Ordering::Relaxed) {
            std::thread::sleep(Duration::from_millis(500));

            let current_text = match clipboard.get_text() {
                Ok(text) => text,
                Err(_) => continue,
            };

            // Skip empty or unchanged clipboard
            if current_text.is_empty() || current_text == last_text {
                continue;
            }

            last_text = current_text.clone();

            let event = ClipboardEvent {
                content: Some(ClipboardContent {
                    text: current_text,
                    content_type: "text".to_string(),
                }),
            };

            if tx.send(event).is_err() {
                // Channel closed, stop monitoring
                break;
            }
        }
    });
}

/// Copies text to the system clipboard
pub fn copy_to_clipboard(text: &str) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("Clipboard init error: {}", e))?;
    clipboard
        .set_text(text)
        .map_err(|e| format!("Copy error: {}", e))
}

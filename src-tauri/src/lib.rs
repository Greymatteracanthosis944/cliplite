mod clipboard;
mod db;

use clipboard::{copy_to_clipboard, start_monitoring, ClipboardEvent};
use db::{ClipEntry, Database};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, Runtime, State};
use tokio::sync::mpsc;

pub struct AppState {
    db: Database,
    monitor_running: Arc<AtomicBool>,
}

// ─── Commands ────────────────────────────────────────────────

#[tauri::command]
fn get_clips(
    state: State<AppState>,
    limit: Option<i64>,
    offset: Option<i64>,
    search: Option<String>,
) -> Result<Vec<ClipEntry>, String> {
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    let search = search.unwrap_or_default();
    state.db.get_clips(limit, offset, &search)
}

/// BUGFIX #4: Query the clip by ID directly instead of scanning only the
/// top 50 entries. Previously paste_clip failed for any clip outside the
/// first page of results.
#[tauri::command]
fn paste_clip(state: State<AppState>, id: i64) -> Result<ClipEntry, String> {
    match state.db.get_clip_by_id(id)? {
        Some(clip) => {
            copy_to_clipboard(&clip.content)?;
            Ok(clip)
        }
        None => Err("Clip not found".to_string()),
    }
}

#[tauri::command]
fn toggle_pin(state: State<AppState>, id: i64) -> Result<bool, String> {
    state.db.toggle_pin(id)
}

#[tauri::command]
fn delete_clip(state: State<AppState>, id: i64) -> Result<(), String> {
    state.db.delete_clip(id)
}

#[tauri::command]
fn get_clip_count(state: State<AppState>) -> Result<i64, String> {
    state.db.get_clip_count()
}

#[tauri::command]
fn clear_all_clips(state: State<AppState>) -> Result<u64, String> {
    state.db.clear_all()
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// ─── Clipboard monitor ───────────────────────────────────────

fn setup_clipboard_monitor<R: Runtime>(app_handle: AppHandle<R>, state: Arc<AppState>) {
    let (tx, mut rx) = mpsc::unbounded_channel::<ClipboardEvent>();
    let running = state.monitor_running.clone();

    start_monitoring(tx, running);

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            if let Some(content) = event.content {
                match state.db.add_clip(&content.text, &content.content_type) {
                    Ok(entry) => {
                        let _ = app_handle.emit("new-clip", entry);
                    }
                    Err(e) => {
                        eprintln!("Failed to store clipboard entry: {}", e);
                    }
                }
            }
        }
        eprintln!("Clipboard monitor stopped");
    });
}

// ─── App entry point ─────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            // BUGFIX #1: Use Tauri's managed app data directory instead of
            // a hardcoded relative path. This prevents write-permission
            // crashes when the app is installed in system directories.
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data directory");

            // Create the directory tree if it doesn't exist
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");

            let db_path = app_data_dir.join("cliplite.db");
            let db_path_str = db_path
                .to_str()
                .expect("App data path contains invalid UTF-8");

            eprintln!("ClipLite: database at {}", db_path_str);

            let app_state = Arc::new(AppState {
                db: Database::new(db_path_str).expect("Failed to initialize database"),
                monitor_running: Arc::new(AtomicBool::new(true)),
            });

            app.manage(app_state.clone());

            let app_handle = app.handle().clone();
            setup_clipboard_monitor(app_handle, app_state);

            // BUGFIX #3: Gracefully handle shortcut registration failure
            // instead of panicking. If Ctrl+Shift+V is already claimed by
            // another app, we fall back to tray-icon-only activation.
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::GlobalShortcutExt;

                let handle = app.handle().clone();
                app.plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut| {
                            if shortcut.matches("Ctrl+Shift+V") {
                                if let Some(window) = handle.get_webview_window("main") {
                                    if window.is_visible().unwrap_or(false) {
                                        let _ = window.hide();
                                    } else {
                                        let _ = window.show();
                                        let _ = window.set_focus();
                                    }
                                }
                            }
                        })
                        .build(),
                )?;

                match app.global_shortcut().register("Ctrl+Shift+V") {
                    Ok(()) => {
                        eprintln!("ClipLite: registered Ctrl+Shift+V global shortcut");
                    }
                    Err(e) => {
                        eprintln!(
                            "ClipLite: could not register Ctrl+Shift+V — {}. \
                             The app is still usable via the system tray icon.",
                            e
                        );
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_clips,
            paste_clip,
            toggle_pin,
            delete_clip,
            clear_all_clips,
            get_clip_count,
            get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running ClipLite");
}

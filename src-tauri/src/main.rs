// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod error;

use commands::{grep_directory, open_directory_dialog, read_file_content, scan_directory};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_directory_dialog,
            scan_directory,
            read_file_content,
            grep_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

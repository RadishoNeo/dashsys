pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_system_info::init())
        .invoke_handler(tauri::generate_handler![
            commands::process::kill_process,
            commands::system_info::get_detailed_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

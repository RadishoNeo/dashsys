pub mod commands;
pub mod database;

use database::DatabaseService;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_system_info::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            let db = DatabaseService::new(app_data_dir).expect("Failed to initialize database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::process::kill_process,
            commands::system_info::get_detailed_system_info,
            commands::history::save_history_data,
            commands::history::get_cpu_history,
            commands::history::get_memory_history,
            commands::history::get_network_history,
            commands::history::get_disk_history,
            commands::history::get_all_history,
            commands::history::get_stats,
            commands::history::cleanup_old_data,
            commands::history::aggregate_hourly
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

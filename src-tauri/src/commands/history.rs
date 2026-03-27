use crate::database::service::{
    CpuHistoryRecord, DatabaseService, DiskHistoryRecord, MemoryHistoryRecord,
    NetworkHistoryRecord, HourlyStats, DailyStats,
};
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveHistoryRequest {
    pub cpu: Option<CpuHistoryInput>,
    pub memory: Option<MemoryHistoryInput>,
    pub network: Option<NetworkHistoryInput>,
    pub disk: Option<DiskHistoryInput>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CpuHistoryInput {
    pub usage: f32,
    pub frequency: u64,
    pub per_core: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryHistoryInput {
    pub usage_percent: f32,
    pub used_bytes: u64,
    pub available_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_total_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NetworkHistoryInput {
    pub interface_name: String,
    pub rx_bytes: u64,
    pub tx_bytes: u64,
    pub rx_speed: f64,
    pub tx_speed: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskHistoryInput {
    pub disk_name: String,
    pub read_speed: f64,
    pub write_speed: f64,
    pub usage_percent: f32,
}

#[derive(Debug, Serialize)]
pub struct HistoryDataResponse {
    pub cpu: Vec<CpuHistoryRecord>,
    pub memory: Vec<MemoryHistoryRecord>,
    pub network: Vec<NetworkHistoryRecord>,
    pub disk: Vec<DiskHistoryRecord>,
}

#[derive(Debug, Serialize)]
pub struct StatsResponse {
    pub hourly: Vec<HourlyStats>,
    pub daily: Vec<DailyStats>,
}

#[tauri::command]
pub fn save_history_data(
    db: State<'_, DatabaseService>,
    request: SaveHistoryRequest,
) -> Result<String, String> {
    let timestamp = chrono::Utc::now().timestamp();

    if let Some(cpu) = &request.cpu {
        let record = CpuHistoryRecord {
            timestamp,
            usage: cpu.usage,
            frequency: cpu.frequency,
            per_core: cpu.per_core.clone(),
        };
        db.insert_cpu_history(&record).map_err(|e| e.to_string())?;
    }

    if let Some(memory) = &request.memory {
        let record = MemoryHistoryRecord {
            timestamp,
            usage_percent: memory.usage_percent,
            used_bytes: memory.used_bytes,
            available_bytes: memory.available_bytes,
            swap_used_bytes: memory.swap_used_bytes,
            swap_total_bytes: memory.swap_total_bytes,
        };
        db.insert_memory_history(&record).map_err(|e| e.to_string())?;
    }

    if let Some(network) = &request.network {
        let record = NetworkHistoryRecord {
            timestamp,
            interface_name: network.interface_name.clone(),
            rx_bytes: network.rx_bytes,
            tx_bytes: network.tx_bytes,
            rx_speed: network.rx_speed,
            tx_speed: network.tx_speed,
        };
        db.insert_network_history(&record).map_err(|e| e.to_string())?;
    }

    if let Some(disk) = &request.disk {
        let record = DiskHistoryRecord {
            timestamp,
            disk_name: disk.disk_name.clone(),
            read_speed: disk.read_speed,
            write_speed: disk.write_speed,
            usage_percent: disk.usage_percent,
        };
        db.insert_disk_history(&record).map_err(|e| e.to_string())?;
    }

    Ok("History data saved successfully".to_string())
}

#[tauri::command]
pub fn get_cpu_history(db: State<'_, DatabaseService>, hours: u32) -> Result<Vec<CpuHistoryRecord>, String> {
    db.get_cpu_history(hours).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_memory_history(db: State<'_, DatabaseService>, hours: u32) -> Result<Vec<MemoryHistoryRecord>, String> {
    db.get_memory_history(hours).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_network_history(db: State<'_, DatabaseService>, hours: u32) -> Result<Vec<NetworkHistoryRecord>, String> {
    db.get_network_history(hours).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_disk_history(db: State<'_, DatabaseService>, hours: u32) -> Result<Vec<DiskHistoryRecord>, String> {
    db.get_disk_history(hours).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_history(db: State<'_, DatabaseService>, hours: u32) -> Result<HistoryDataResponse, String> {
    let cpu = db.get_cpu_history(hours).map_err(|e| e.to_string())?;
    let memory = db.get_memory_history(hours).map_err(|e| e.to_string())?;
    let network = db.get_network_history(hours).map_err(|e| e.to_string())?;
    let disk = db.get_disk_history(hours).map_err(|e| e.to_string())?;

    Ok(HistoryDataResponse {
        cpu,
        memory,
        network,
        disk,
    })
}

#[tauri::command]
pub fn get_stats(db: State<'_, DatabaseService>, days: u32) -> Result<StatsResponse, String> {
    let hourly = db.get_hourly_stats(days).map_err(|e| e.to_string())?;
    let daily = db.get_daily_stats(days).map_err(|e| e.to_string())?;

    Ok(StatsResponse {
        hourly,
        daily,
    })
}

#[tauri::command]
pub fn cleanup_old_data(db: State<'_, DatabaseService>) -> Result<String, String> {
    db.cleanup_old_data().map_err(|e| e.to_string())?;
    Ok("Old data cleaned up successfully".to_string())
}

#[tauri::command]
pub fn aggregate_hourly(db: State<'_, DatabaseService>) -> Result<String, String> {
    db.aggregate_hourly_stats().map_err(|e| e.to_string())?;
    Ok("Hourly stats aggregated successfully".to_string())
}
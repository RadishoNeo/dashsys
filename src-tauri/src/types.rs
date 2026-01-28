use serde::{Serialize, Deserialize};

#[derive(Serialize, Clone)]
pub struct ApiResponse<T> {
    pub data: T,
    pub timestamp: u64,
}

#[derive(Serialize)]
pub struct CpuStats {
    pub usage: f32,           // 0-100
    pub frequency: u64,       // MHz
    pub core_count: usize,
    pub per_core: Vec<f32>,   // 各核心使用率
    pub load_avg: [f64; 3],   // 1min, 5min, 15min
}

#[derive(Serialize, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub status: String,
    pub cpu_usage: f32,
    pub memory: u64,
    pub virtual_memory: u64,
    pub disk_read: u64,
    pub disk_written: u64,
    pub parent: Option<u32>,
    pub command: Option<String>,
}

// 错误处理统一包装
pub type CommandResult<T> = Result<ApiResponse<T>, String>;

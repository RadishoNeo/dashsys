pub const SCHEMA: &str = "
-- CPU 历史数据
CREATE TABLE IF NOT EXISTS cpu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    usage REAL NOT NULL,
    frequency INTEGER,
    per_core TEXT
);

-- 内存历史数据
CREATE TABLE IF NOT EXISTS memory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    usage_percent REAL NOT NULL,
    used_bytes INTEGER,
    available_bytes INTEGER,
    swap_used_bytes INTEGER,
    swap_total_bytes INTEGER
);

-- 网络历史数据
CREATE TABLE IF NOT EXISTS network_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    interface_name TEXT NOT NULL,
    rx_bytes INTEGER,
    tx_bytes INTEGER,
    rx_speed REAL,
    tx_speed REAL
);

-- 磁盘历史数据
CREATE TABLE IF NOT EXISTS disk_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    disk_name TEXT NOT NULL,
    read_speed REAL,
    write_speed REAL,
    usage_percent REAL
);

-- 系统状态聚合数据 (每小时)
CREATE TABLE IF NOT EXISTS hourly_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hour_timestamp INTEGER NOT NULL,
    avg_cpu_usage REAL,
    max_cpu_usage REAL,
    avg_memory_usage REAL,
    max_memory_usage REAL,
    total_rx_bytes INTEGER,
    total_tx_bytes INTEGER
);

-- 系统状态聚合数据 (每天)
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_timestamp INTEGER NOT NULL,
    avg_cpu_usage REAL,
    max_cpu_usage REAL,
    avg_memory_usage REAL,
    max_memory_usage REAL,
    total_rx_bytes INTEGER,
    total_tx_bytes INTEGER
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cpu_timestamp ON cpu_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_network_timestamp ON network_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_disk_timestamp ON disk_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_hourly_timestamp ON hourly_stats(hour_timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_timestamp ON daily_stats(day_timestamp);
";
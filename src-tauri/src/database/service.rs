use crate::database::schema::SCHEMA;
use chrono::{Duration, Utc};
use rusqlite::{Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct DatabaseService {
    conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CpuHistoryRecord {
    pub timestamp: i64,
    pub usage: f32,
    pub frequency: u64,
    pub per_core: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryHistoryRecord {
    pub timestamp: i64,
    pub usage_percent: f32,
    pub used_bytes: u64,
    pub available_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_total_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkHistoryRecord {
    pub timestamp: i64,
    pub interface_name: String,
    pub rx_bytes: u64,
    pub tx_bytes: u64,
    pub rx_speed: f64,
    pub tx_speed: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiskHistoryRecord {
    pub timestamp: i64,
    pub disk_name: String,
    pub read_speed: f64,
    pub write_speed: f64,
    pub usage_percent: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HourlyStats {
    pub hour_timestamp: i64,
    pub avg_cpu_usage: f32,
    pub max_cpu_usage: f32,
    pub avg_memory_usage: f32,
    pub max_memory_usage: f32,
    pub total_rx_bytes: u64,
    pub total_tx_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailyStats {
    pub day_timestamp: i64,
    pub avg_cpu_usage: f32,
    pub max_cpu_usage: f32,
    pub avg_memory_usage: f32,
    pub max_memory_usage: f32,
    pub total_rx_bytes: u64,
    pub total_tx_bytes: u64,
}

impl DatabaseService {
    pub fn new(app_data_dir: PathBuf) -> SqliteResult<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("data.db");
        let conn = Connection::open(db_path)?;
        conn.execute_batch(SCHEMA)?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn insert_cpu_history(&self, record: &CpuHistoryRecord) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let per_core_json = serde_json::to_string(&record.per_core).unwrap_or_else(|_| "[]".to_string());
        conn.execute(
            "INSERT INTO cpu_history (timestamp, usage, frequency, per_core) VALUES (?1, ?2, ?3, ?4)",
            [
                &record.timestamp.to_string(),
                &record.usage.to_string(),
                &record.frequency.to_string(),
                &per_core_json,
            ],
        )?;
        Ok(())
    }

    pub fn insert_memory_history(&self, record: &MemoryHistoryRecord) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO memory_history (timestamp, usage_percent, used_bytes, available_bytes, swap_used_bytes, swap_total_bytes) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &record.timestamp.to_string(),
                &record.usage_percent.to_string(),
                &record.used_bytes.to_string(),
                &record.available_bytes.to_string(),
                &record.swap_used_bytes.to_string(),
                &record.swap_total_bytes.to_string(),
            ],
        )?;
        Ok(())
    }

    pub fn insert_network_history(&self, record: &NetworkHistoryRecord) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO network_history (timestamp, interface_name, rx_bytes, tx_bytes, rx_speed, tx_speed) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &record.timestamp.to_string(),
                &record.interface_name,
                &record.rx_bytes.to_string(),
                &record.tx_bytes.to_string(),
                &record.rx_speed.to_string(),
                &record.tx_speed.to_string(),
            ],
        )?;
        Ok(())
    }

    pub fn insert_disk_history(&self, record: &DiskHistoryRecord) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO disk_history (timestamp, disk_name, read_speed, write_speed, usage_percent) VALUES (?1, ?2, ?3, ?4, ?5)",
            [
                &record.timestamp.to_string(),
                &record.disk_name,
                &record.read_speed.to_string(),
                &record.write_speed.to_string(),
                &record.usage_percent.to_string(),
            ],
        )?;
        Ok(())
    }

    pub fn get_cpu_history(&self, hours: u32) -> SqliteResult<Vec<CpuHistoryRecord>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::hours(hours as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT timestamp, usage, frequency, per_core FROM cpu_history WHERE timestamp >= ?1 ORDER BY timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            let per_core_json: String = row.get(3)?;
            let per_core: Vec<f32> = serde_json::from_str(&per_core_json).unwrap_or_default();
            Ok(CpuHistoryRecord {
                timestamp: row.get(0)?,
                usage: row.get(1)?,
                frequency: row.get(2)?,
                per_core,
            })
        })?;
        records.collect()
    }

    pub fn get_memory_history(&self, hours: u32) -> SqliteResult<Vec<MemoryHistoryRecord>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::hours(hours as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT timestamp, usage_percent, used_bytes, available_bytes, swap_used_bytes, swap_total_bytes FROM memory_history WHERE timestamp >= ?1 ORDER BY timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            Ok(MemoryHistoryRecord {
                timestamp: row.get(0)?,
                usage_percent: row.get(1)?,
                used_bytes: row.get(2)?,
                available_bytes: row.get(3)?,
                swap_used_bytes: row.get(4)?,
                swap_total_bytes: row.get(5)?,
            })
        })?;
        records.collect()
    }

    pub fn get_network_history(&self, hours: u32) -> SqliteResult<Vec<NetworkHistoryRecord>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::hours(hours as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT timestamp, interface_name, rx_bytes, tx_bytes, rx_speed, tx_speed FROM network_history WHERE timestamp >= ?1 ORDER BY timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            Ok(NetworkHistoryRecord {
                timestamp: row.get(0)?,
                interface_name: row.get(1)?,
                rx_bytes: row.get(2)?,
                tx_bytes: row.get(3)?,
                rx_speed: row.get(4)?,
                tx_speed: row.get(5)?,
            })
        })?;
        records.collect()
    }

    pub fn get_disk_history(&self, hours: u32) -> SqliteResult<Vec<DiskHistoryRecord>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::hours(hours as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT timestamp, disk_name, read_speed, write_speed, usage_percent FROM disk_history WHERE timestamp >= ?1 ORDER BY timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            Ok(DiskHistoryRecord {
                timestamp: row.get(0)?,
                disk_name: row.get(1)?,
                read_speed: row.get(2)?,
                write_speed: row.get(3)?,
                usage_percent: row.get(4)?,
            })
        })?;
        records.collect()
    }

    pub fn cleanup_old_data(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let cutoff_30d = (Utc::now() - Duration::days(30)).timestamp();
        let cutoff_365d = (Utc::now() - Duration::days(365)).timestamp();

        conn.execute("DELETE FROM cpu_history WHERE timestamp < ?1", [cutoff_365d])?;
        conn.execute("DELETE FROM memory_history WHERE timestamp < ?1", [cutoff_365d])?;
        conn.execute("DELETE FROM network_history WHERE timestamp < ?1", [cutoff_365d])?;
        conn.execute("DELETE FROM disk_history WHERE timestamp < ?1", [cutoff_365d])?;
        conn.execute("DELETE FROM hourly_stats WHERE hour_timestamp < ?1", [cutoff_30d])?;
        conn.execute("DELETE FROM daily_stats WHERE day_timestamp < ?1", [cutoff_365d])?;
        Ok(())
    }

    pub fn aggregate_hourly_stats(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now();
        let hour_start = now - Duration::hours(1);
        let hour_ts = hour_start.timestamp();
        let now_ts = now.timestamp();

        let avg_cpu: Option<f32> = conn.query_row(
            "SELECT AVG(usage) FROM cpu_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        let max_cpu: Option<f32> = conn.query_row(
            "SELECT MAX(usage) FROM cpu_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        let avg_memory: Option<f32> = conn.query_row(
            "SELECT AVG(usage_percent) FROM memory_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        let max_memory: Option<f32> = conn.query_row(
            "SELECT MAX(usage_percent) FROM memory_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        let total_rx: Option<u64> = conn.query_row(
            "SELECT SUM(rx_bytes) FROM network_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        let total_tx: Option<u64> = conn.query_row(
            "SELECT SUM(tx_bytes) FROM network_history WHERE timestamp >= ?1 AND timestamp < ?2",
            [hour_ts, now_ts],
            |row| row.get(0),
        ).ok().flatten();

        conn.execute(
            "INSERT OR REPLACE INTO hourly_stats (hour_timestamp, avg_cpu_usage, max_cpu_usage, avg_memory_usage, max_memory_usage, total_rx_bytes, total_tx_bytes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                hour_ts,
                avg_cpu.unwrap_or(0.0),
                max_cpu.unwrap_or(0.0),
                avg_memory.unwrap_or(0.0),
                max_memory.unwrap_or(0.0),
                total_rx.unwrap_or(0),
                total_tx.unwrap_or(0),
            ],
        )?;

        Ok(())
    }

    pub fn get_hourly_stats(&self, days: u32) -> SqliteResult<Vec<HourlyStats>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::days(days as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT hour_timestamp, avg_cpu_usage, max_cpu_usage, avg_memory_usage, max_memory_usage, total_rx_bytes, total_tx_bytes FROM hourly_stats WHERE hour_timestamp >= ?1 ORDER BY hour_timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            Ok(HourlyStats {
                hour_timestamp: row.get(0)?,
                avg_cpu_usage: row.get(1)?,
                max_cpu_usage: row.get(2)?,
                avg_memory_usage: row.get(3)?,
                max_memory_usage: row.get(4)?,
                total_rx_bytes: row.get(5)?,
                total_tx_bytes: row.get(6)?,
            })
        })?;
        records.collect()
    }

    pub fn get_daily_stats(&self, days: u32) -> SqliteResult<Vec<DailyStats>> {
        let conn = self.conn.lock().unwrap();
        let cutoff = (Utc::now() - Duration::days(days as i64)).timestamp();
        let mut stmt = conn.prepare(
            "SELECT day_timestamp, avg_cpu_usage, max_cpu_usage, avg_memory_usage, max_memory_usage, total_rx_bytes, total_tx_bytes FROM daily_stats WHERE day_timestamp >= ?1 ORDER BY day_timestamp ASC"
        )?;
        let records = stmt.query_map([cutoff], |row| {
            Ok(DailyStats {
                day_timestamp: row.get(0)?,
                avg_cpu_usage: row.get(1)?,
                max_cpu_usage: row.get(2)?,
                avg_memory_usage: row.get(3)?,
                max_memory_usage: row.get(4)?,
                total_rx_bytes: row.get(5)?,
                total_tx_bytes: row.get(6)?,
            })
        })?;
        records.collect()
    }
}
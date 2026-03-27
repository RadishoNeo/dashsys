export interface CpuHistoryRecord {
  timestamp: number;
  usage: number;
  frequency: number;
  per_core: number[];
}

export interface MemoryHistoryRecord {
  timestamp: number;
  usage_percent: number;
  used_bytes: number;
  available_bytes: number;
  swap_used_bytes: number;
  swap_total_bytes: number;
}

export interface NetworkHistoryRecord {
  timestamp: number;
  interface_name: string;
  rx_bytes: number;
  tx_bytes: number;
  rx_speed: number;
  tx_speed: number;
}

export interface DiskHistoryRecord {
  timestamp: number;
  disk_name: string;
  read_speed: number;
  write_speed: number;
  usage_percent: number;
}

export interface HourlyStats {
  hour_timestamp: number;
  avg_cpu_usage: number;
  max_cpu_usage: number;
  avg_memory_usage: number;
  max_memory_usage: number;
  total_rx_bytes: number;
  total_tx_bytes: number;
}

export interface DailyStats {
  day_timestamp: number;
  avg_cpu_usage: number;
  max_cpu_usage: number;
  avg_memory_usage: number;
  max_memory_usage: number;
  total_rx_bytes: number;
  total_tx_bytes: number;
}

export interface HistoryDataResponse {
  cpu: CpuHistoryRecord[];
  memory: MemoryHistoryRecord[];
  network: NetworkHistoryRecord[];
  disk: DiskHistoryRecord[];
}

export interface StatsResponse {
  hourly: HourlyStats[];
  daily: DailyStats[];
}
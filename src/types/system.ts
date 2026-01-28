// 基础类型
export type ByteSize = number; // 字节，前端需格式化显示
export type Percentage = number; // 0-100
export type Timestamp = number; // Unix timestamp (seconds)

// CPU 相关
export interface CpuInfo {
  brand: string;
  vendor_id: string;
  frequency: number; // MHz
  physical_cores: number;
  logical_cpus: number;
}

export interface CpuStats {
  usage: Percentage;
  frequency: number;
  core_count: number;
  per_core: Percentage[];
  load_avg: [number, number, number]; // 1, 5, 15 min
}

// 内存相关
export interface MemoryStats {
  total: ByteSize;
  used: ByteSize;
  available: ByteSize;
  free: ByteSize;
  swap_total: ByteSize;
  swap_used: ByteSize;
  usage_percent: Percentage;
}

// 磁盘相关
export interface DiskInfo {
  name: string;
  mount_point: string;
  total_space: ByteSize;
  available_space: ByteSize;
  used_space: ByteSize;
  file_system: string;
  is_removable: boolean;
  usage_percent: Percentage;
}

// 网络相关
export interface NetworkInterface {
  name: string;
  rx_bytes: ByteSize;
  tx_bytes: ByteSize;
  rx_errors: number;
  tx_errors: number;
  speed?: number; // Mbps
}

export interface NetworkStats {
  interfaces: NetworkInterface[];
  total_rx: ByteSize;
  total_tx: ByteSize;
}

// 进程相关
export interface ProcessInfo {
  pid: number;
  name: string;
  status: "Running" | "Sleeping" | "Stopped" | "Zombie";
  cpu_usage: Percentage;
  memory: ByteSize; // RSS
  virtual_memory: ByteSize;
  disk_read: ByteSize;
  disk_written: ByteSize;
  parent?: number;
  command?: string;
}

// 系统静态信息
export interface SystemInfo {
  hostname: string;
  os_name: string; // "macOS", "Windows", "Linux"
  os_version: string; // "14.2.1"
  kernel_version: string;
  arch: string; // "x86_64" | "aarch64"
  uptime: number; // seconds
}

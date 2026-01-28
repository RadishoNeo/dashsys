## 1. 项目架构总览

### 1.1 技术栈版本锁定

```yaml
Tauri: 2.x (v2 stable)
Frontend: React 19 + TypeScript 5.x + Vite 7.x + sonner +Bun 
Styling: TailwindCSS 4
Charts: ECharts 5.x (echarts-for-react)
State: Zustand 
Icons: Lucide React
Utils: date-fns (时间格式化), usehooks-ts (工具 hooks)
```

### 1.2 目录结构规范

```text
src/
├── components/           # 原子组件（纯展示）
│   ├── charts/          # ECharts 封装组件
│   ├── metrics/         # 指标卡片组件
│   └── layout/          # 布局组件
├── features/            # 功能模块（按业务域划分）
│   ├── cpu/             # CPU 监控模块
│   ├── memory/          # 内存监控模块
│   ├── disk/            # 磁盘监控模块
│   ├── network/         # 网络监控模块
│   └── processes/       # 进程管理模块
├── hooks/               # 全局 Hooks
│   ├── useSystemStats.ts
│   ├── useRealtimeUpdate.ts
│   └── useTauriCommand.ts
├── stores/              # Zustand 状态管理
│   ├── systemStore.ts   # 系统信息全局状态
│   └── settingsStore.ts # 用户设置
├── lib/                 # 工具函数
│   ├── tauri.ts         # Tauri 命令封装
│   ├── format.ts        # 数据格式化（bytes, duration等）
│   └── constants.ts     # 常量定义
├── types/               # TypeScript 类型定义
│   └── system.ts        # 系统信息类型
└── App.tsx              # 根组件
src-tauri/
├── src/
│   ├── lib.rs           # 全局状态初始化
│   ├── commands/        # 命令模块
│   │   ├── mod.rs
│   │   ├── cpu.rs       # CPU 相关命令
│   │   ├── memory.rs    # 内存相关命令
│   │   ├── disk.rs      # 磁盘相关命令
│   │   └── process.rs   # 进程管理命令
│   └── main.rs          # 入口
```

---

## 2. 数据流设计（核心）

### 2.1 架构模式

**前端轮询 + 后端缓存**模式。由于 Tauri v2 IPC 性能优秀，使用拉模式（Pull）比推模式（Event）更易控制。

```typescript
// hooks/useRealtimeUpdate.ts
export const useRealtimeUpdate = <T>(
  command: string,
  interval: number = 1000
) => {
  const [data, setData] = useState<T | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      const result = await invoke<T>(command);
      if (mounted) setData(result);
    };
    
    fetch();
    const timer = setInterval(fetch, interval);
    return () => { mounted = false; clearInterval(timer); };
  }, [command, interval]);
  
  return data;
};
```

### 2.2 状态分层

```typescript
// stores/systemStore.ts
interface SystemState {
  // 实时数据（高频更新）
  realtime: {
    cpu: CpuStats | null;
    memory: MemoryStats | null;
    network: NetworkStats | null;
    timestamp: number;
  };
  
  // 准实时数据（中频更新）
  medium: {
    processes: ProcessInfo[];
    disks: DiskInfo[];
  };
  
  // 静态数据（低频更新）
  static: {
    systemInfo: SystemInfo | null;
    cpuInfo: CpuInfo | null;
  };
  
  // Actions
  updateRealtime: (data: Partial<SystemState['realtime']>) => void;
  updateMedium: (data: Partial<SystemState['medium']>) => void;
}
```

---

## 3. Rust 后端规范

### 3.1 命令返回结构

所有 Tauri 命令必须返回 `Result<T, String>`，T 必须是可序列化的结构体。

```rust
// src-tauri/src/types.rs
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

// 错误处理统一包装
pub type CommandResult<T> = Result<ApiResponse<T>, String>;
```

### 3.2 System Info 初始化

使用 `tauri-plugin-system-info` 插件初始化 System 实例，避免重复创建。


### 3.3 Command 实现模板

```rust
// src-tauri/src/commands/cpu.rs
use crate::{AppState, types::{CpuStats, CommandResult}};
use tauri::State;

#[tauri::command]
pub fn get_cpu_stats(state: State<AppState>) -> CommandResult<CpuStats> {
    let mut sys = state.system.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu();  // 只刷新 CPU，避免全量刷新开销
    
    let cpus = sys.cpus();
    let global_cpu = sys.global_cpu_info();
    
    let stats = CpuStats {
        usage: global_cpu.cpu_usage(),
        frequency: global_cpu.frequency(),
        core_count: cpus.len(),
        per_core: cpus.iter().map(|c| c.cpu_usage()).collect(),
        load_avg: System::load_average(),
    };
    
    Ok(ApiResponse {
        data: stats,
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    })
}
```

---

## 4. 前端组件规范

### 4.1 图表组件封装

使用 ECharts 需封装为通用组件，避免重复配置。

```typescript
// components/charts/RealtimeLineChart.tsx
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  data: number[];           // 最新数据点
  maxPoints?: number;       // 最多显示点数（默认 60）
  color?: string;
  unit?: string;
  title: string;
}

export const RealtimeLineChart: React.FC<Props> = ({
  data, maxPoints = 60, color = '#3b82f6', unit = '%', title
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const dataRef = useRef<number[]>([]);  // 内部维护历史数组
  
  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas'
    });
    
    const option: echarts.EChartsOption = {
      grid: { top: 40, right: 20, bottom: 20, left: 40 },
      xAxis: {
        type: 'category',
        show: false,
        data: Array(maxPoints).fill(''),
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '40' },  // 透明度 25%
            { offset: 1, color: color + '00' },
          ])
        },
        lineStyle: { color, width: 2 },
        data: [],
      }],
      tooltip: { trigger: 'axis' },
    };
    
    chartInstance.current.setOption(option);
    
    return () => chartInstance.current?.dispose();
  }, [maxPoints, color]);
  
  // 更新数据（高频优化：使用 setOption 增量更新）
  useEffect(() => {
    if (!chartInstance.current) return;
    
    dataRef.current = [...dataRef.current.slice(-maxPoints + 1), data[data.length - 1]];
    
    chartInstance.current.setOption({
      series: [{ data: dataRef.current }]
    });
  }, [data, maxPoints]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <div ref={chartRef} className="h-48" />
      <div className="mt-2 text-right text-xs text-gray-500">
        当前: {data[data.length - 1]?.toFixed(1)}{unit}
      </div>
    </div>
  );
};
```

### 4.2 指标卡片组件

```typescript
// components/metrics/MetricCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
}

export const MetricCard: React.FC<Props> = ({
  title, value, subValue, icon: Icon, status = 'normal', trend
}) => {
  const statusColors = {
    normal: 'border-l-4 border-blue-500 bg-blue-50',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50',
    danger: 'border-l-4 border-red-500 bg-red-50',
  };
  
  return (
    <div className={`p-4 rounded-lg shadow-sm ${statusColors[status]} dark:bg-gray-800`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );
};
```

---

## 5. Feature 模块开发规范

每个功能模块必须包含以下文件结构：

```
features/cpu/
├── index.ts              # 导出接口
├── components/           # 模块内部组件
│   ├── CpuChart.tsx      # CPU 折线图
│   ├── CoreGrid.tsx      # 核心网格
│   └── CpuDetail.tsx     # 详情面板
├── hooks/
│   └── useCpuStats.ts    # 封装数据获取逻辑
├── types.ts              # 模块类型（继承全局类型）
└── utils.ts              # 模块工具函数（如频率格式化）
```

### 5.1 hooks/useCpuStats.ts 示例

```typescript
// features/cpu/hooks/useCpuStats.ts
import { useCallback, useEffect, useRef } from 'react';
import { useSystemStore } from '@/stores/systemStore';
import { invoke } from '@tauri-apps/api/core';
import type { CpuStats } from '@/types/system';

const HISTORY_LENGTH = 60;

export const useCpuStats = (interval: number = 1000) => {
  const { realtime, updateRealtime } = useSystemStore();
  const historyRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));
  
  const fetchStats = useCallback(async () => {
    try {
      const response = await invoke<{ data: CpuStats; timestamp: number }>('get_cpu_stats');
      
      // 更新历史数据用于图表
      historyRef.current = [
        ...historyRef.current.slice(1),
        response.data.usage
      ];
      
      updateRealtime({
        cpu: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      console.error('Failed to fetch CPU stats:', error);
    }
  }, [updateRealtime]);
  
  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, interval);
    return () => clearInterval(timer);
  }, [fetchStats, interval]);
  
  return {
    current: realtime.cpu,
    history: historyRef.current,
    coreCount: realtime.cpu?.core_count || 0,
    loadAvg: realtime.cpu?.load_avg || [0, 0, 0],
  };
};
```

---

## 6. 类型定义规范

```typescript
// types/system.ts

// 基础类型
export type ByteSize = number;  // 字节，前端需格式化显示
export type Percentage = number; // 0-100
export type Timestamp = number;  // Unix timestamp (seconds)

// CPU 相关
export interface CpuInfo {
  brand: string;
  vendor_id: string;
  frequency: number;  // MHz
  physical_cores: number;
  logical_cpus: number;
}

export interface CpuStats {
  usage: Percentage;
  frequency: number;
  core_count: number;
  per_core: Percentage[];
  load_avg: [number, number, number];  // 1, 5, 15 min
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
  speed?: number;  // Mbps
}

// 进程相关
export interface ProcessInfo {
  pid: number;
  name: string;
  status: 'Running' | 'Sleeping' | 'Stopped' | 'Zombie';
  cpu_usage: Percentage;
  memory: ByteSize;  // RSS
  virtual_memory: ByteSize;
  disk_read: ByteSize;
  disk_written: ByteSize;
  parent?: number;
  command?: string;
}

// 系统静态信息
export interface SystemInfo {
  hostname: string;
  os_name: string;      // "macOS", "Windows", "Linux"
  os_version: string;   // "14.2.1"
  kernel_version: string;
  arch: string;         // "x86_64" | "aarch64"
  uptime: number;       // seconds
}
```

---

## 7. 工具函数库

```typescript
// lib/format.ts

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + '%';
};

// 计算每秒速率 (用于网络)
export const calculateSpeed = (
  currentBytes: number, 
  lastBytes: number, 
  timeDeltaMs: number
): number => {
  if (timeDeltaMs === 0) return 0;
  return ((currentBytes - lastBytes) * 1000) / timeDeltaMs; // bytes/s
};
```

---

## 8. AI Agent 开发检查清单

当 Agent 实现新功能时，必须验证:

### Rust 后端

- [ ] Command 函数使用 `#[tauri::command]` 宏
- [ ] 所有类型实现 `Serialize`
- [ ] 错误处理返回 `Result<T, String>`
- [ ] System 实例通过 State 共享，避免重复创建
- [ ] 使用 `refresh_cpu()` 等特定刷新方法，而非 `refresh_all()`（性能）
- [ ] 在 `lib.rs` 中注册命令到 `invoke_handler`

### 前端

- [ ] 使用 `useRealtimeUpdate` 或类似 Hook 获取数据
- [ ] 图表组件使用 `useRef` 缓存 ECharts 实例
- [ ] Zustand Store 按频率分层存储（realtime/medium/static）
- [ ] 数字格式化使用 `lib/format.ts` 中的工具函数
- [ ] 添加 `dark:` 类名支持暗黑模式
- [ ] 错误边界处理（try-catch 或 ErrorBoundary）

### 性能优化

- [ ] 高频数据（CPU/网络）使用 1s 间隔，中频（进程）使用 3s
- [ ] 图表历史数据限制在 60-120 个点
- [ ] 进程列表使用虚拟滚动（如果数量 > 50）
- [ ] 组件使用 `React.memo` 避免不必要重渲染

---

## 9. 示例：实现 CPU 监控模块

这是一个完整的 Agent 实现示例：

**Step 1: Rust Command**

```rust
// src-tauri/src/commands/cpu.rs
// 已实现，见第 3.3 节
```

**Step 2: Frontend Hook**

```typescript
// features/cpu/hooks/useCpuStats.ts
// 已实现，见第 5.1 节
```

**Step 3: Component**

```typescript
// features/cpu/components/CpuMonitor.tsx
import React from 'react';
import { useCpuStats } from '../hooks/useCpuStats';
import { RealtimeLineChart } from '@/components/charts/RealtimeLineChart';
import { MetricCard } from '@/components/metrics/MetricCard';
import { Cpu } from 'lucide-react';
import { formatPercentage } from '@/lib/format';

export const CpuMonitor: React.FC = () => {
  const { current, history, coreCount, loadAvg } = useCpuStats(1000);
  
  if (!current) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="CPU Usage"
          value={formatPercentage(current.usage)}
          subValue={`${coreCount} Cores`}
          icon={Cpu}
          status={current.usage > 90 ? 'danger' : current.usage > 70 ? 'warning' : 'normal'}
        />
        <MetricCard
          title="Load Average (1m)"
          value={loadAvg[0].toFixed(2)}
          subValue={`5m: ${loadAvg[1].toFixed(2)} | 15m: ${loadAvg[2].toFixed(2)}`}
          icon={Cpu}
        />
        <MetricCard
          title="Frequency"
          value={`${(current.frequency / 1000).toFixed(2)} GHz`}
          icon={Cpu}
        />
      </div>
      
      <RealtimeLineChart
        title="CPU Usage History"
        data={history}
        maxPoints={60}
        color="#3b82f6"
        unit="%"
      />
    </div>
  );
};
```

**Step 4: Route/Integration**

```typescript
// App.tsx 或路由配置
import { CpuMonitor } from './features/cpu';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        System Dashboard
      </h1>
      <CpuMonitor />
    </div>
  );
}
```

---

## 10. 调试与测试

### Tauri DevTools

- 使用 `Ctrl+Shift+I`（Windows/Linux）或 `Cmd+Option+I`（macOS）打开 DevTools
- 在 Console 查看 Tauri 命令调用日志

### 模拟数据模式

当后端未实现时，可使用模拟数据：

```typescript
// lib/mock.ts
export const mockCpuStats = (): CpuStats => ({
  usage: Math.random() * 30 + 20,
  frequency: 2400,
  core_count: 8,
  per_core: Array(8).fill(0).map(() => Math.random() * 30 + 20),
  load_avg: [0.5, 0.6, 0.7],
});

// hooks/useCpuStats.ts 中条件编译
const USE_MOCK = import.meta.env.DEV && false;  // 切换开关
```

遵循以上规范，AI Agent 可以高效地为科秒智创（杭州）科技有限责任公司开发出一套专业、高性能的系统信息看板。

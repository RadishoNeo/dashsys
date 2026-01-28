# 开发任务清单

## 1. 项目初始化与架构搭建

- [×] **目录结构创建**: 按照 `1.2` 节规范创建 `src/components`, `src/features`, `src/hooks`, `src/stores`, `src/lib`, `src/types` 等目录
- [×] **依赖安装**: 安装 React 19, TailwindCSS 4, ECharts (echarts-for-react), Zustand, Lucide React, date-fns, usehooks-ts, sonner

## 2. 类型定义与工具库 (Shared)

- [×] **TypeScript 类型定义**: 创建 `src/types/system.ts`，定义 `CpuStats`, `MemoryStats`, `DiskInfo`, `ProcessInfo`, `SystemInfo` 等接口 (参考 `6. 类型定义规范`)
- [×] **前端工具函数**: 创建 `src/lib/format.ts`，实现 `formatBytes`, `formatDuration`, `formatPercentage`, `calculateSpeed` (参考 `7. 工具函数库`)
- [×] **Rust 类型定义**: 在 `src-tauri/src/types.rs` 中定义 `ApiResponse<T>`, `CpuStats` 等结构体，并实现 `Serialize` (参考 `3.1 命令返回结构`)

## 3. Rust 后端开发

- [ ] **System 实例初始化**: 在 `src-tauri/src/lib.rs` 中实现 `AppState` 和 `tauri-plugin-system-info` 的初始化与互斥锁管理 (参考 `3.2 System Info 初始化`)


## 4. 前端核心架构

- [×] **状态管理 (Zustand)**: 创建 `src/stores/systemStore.ts`，实现分层状态管理 (realtime, medium, static) (参考 `2.2 状态分层`)
- [ ] **全局 Hooks**:
  - [×] `useRealtimeUpdate`: 实现通用的轮询 Hook (参考 `2.1 架构模式`)
  - [×] `useSystemStats`: 封装系统信息的获取逻辑

## 5. UI 组件开发

- [×] **图表组件**: 创建 `src/components/charts/RealtimeLineChart.tsx`，封装 ECharts 折线图 (参考 `4.1 图表组件封装`)
- [×] **指标卡片**: 创建 `src/components/metrics/MetricCard.tsx` (参考 `4.2 指标卡片组件`)
- [×] **布局组件**: 开发应用的主布局结构

## 6. 功能模块实现 (Features)

- [×] **CPU 模块**:
  - [×] 实现 `features/cpu/hooks/useCpuStats.ts` (参考 `5.1 示例`)
  - [×] 实现 `features/cpu/components/CpuMonitor.tsx`
- [×] **内存模块**: 开发内存监控组件与 Hooks
- [×] **磁盘模块**: 开发磁盘使用率监控组件
- [×] **网络模块**: 开发网络流量监控组件
- [×] **进程管理模块**: 开发进程列表与管理组件

## 7. 调试与验证

- [×] **后端验证**: 检查所有 Command 是否返回 `Result<T, String>`
- [×] **前端验证**: 检查图表是否正常渲染，内存是否泄漏 (Timer 清理)
- [×] **暗黑模式**: 验证所有组件的 Dark Mode 适配

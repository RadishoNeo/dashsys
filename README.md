# DashSys - 系统监控仪表板

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue?logo=tauri)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-blue?logo=tailwindcss)

**现代化的跨平台系统监控桌面应用**

</div>

## 📋 项目简介

DashSys 是一个基于 **Tauri 2.x** 构建的现代化系统监控仪表板，提供实时的系统资源监控功能。应用采用 React 19 + TypeScript + Tailwind CSS 技术栈，结合 shadcn/ui 组件库，提供美观且高效的用户体验。

### ✨ 核心功能

- **CPU 监控**: 实时显示 CPU 使用率、核心状态、温度监控
- **内存监控**: 跟踪物理内存、虚拟内存使用情况
- **磁盘监控**: 监控磁盘读写速度、存储空间使用
- **网络监控**: 实时网络流量统计、连接状态
- **进程管理**: 查看系统进程、资源占用排行

## 🛠️ 技术栈

### 前端框架
- **React 19** - 最新的 React 框架
- **TypeScript 5.9** - 类型安全的 JavaScript 超集
- **Vite 7** - 极速的构建工具和开发服务器
- **Tailwind CSS 4** - 实用优先的 CSS 框架

### 桌面端
- **Tauri 2.x** - 轻量级、高性能的桌面应用框架
- **Rust** - 底层系统交互

### UI 组件
- **shadcn/ui** - 可复用的 UI 组件集合
- **Radix UI** - 无头组件原语
- **Lucide React** - 精美的图标库
- **Sonner** - 优雅的 Toast 通知

### 数据可视化
- **ECharts 5** - 强大的图表库
- **ECharts for React** - React 集成

### 状态管理
- **Zustand** - 轻量级状态管理
- **usehooks-ts** - 常用 React Hooks 集合

### 其他依赖
- **date-fns** - 日期处理工具
- **tauri-plugin-system-info-api** - 系统信息插件

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- Bun (推荐) 或 npm/yarn/pnpm
- Rust (用于 Tauri 开发)
- Tauri CLI

### 安装依赖

```bash
# 使用 Bun (推荐)
bun install

# 或使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
bun run dev

# 或使用 Tauri CLI
bun run tauri dev
```

### 构建应用

```bash
# 构建生产版本
bun run build

# 构建桌面应用
bun run tauri build

# 构建特定平台
bun run tauri build --target all
```

## 📁 项目结构

```
dashsys/
├── src/
│   ├── components/           # 通用组件
│   │   └── ui/              # shadcn/ui 组件
│   ├── features/            # 功能模块
│   │   ├── cpu/             # CPU 监控
│   │   ├── memory/          # 内存监控
│   │   ├── disk/            # 磁盘监控
│   │   ├── network/         # 网络监控
│   │   └── processes/       # 进程管理
│   ├── hooks/               # 自定义 Hooks
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── src-tauri/               # Tauri 配置
│   ├── src/                 # Rust 源码
│   ├── tauri.conf.json      # Tauri 配置
│   └── Cargo.toml           # Rust 依赖
├── public/                  # 静态资源
├── index.html               # HTML 入口
├── package.json             # Node 依赖
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── tailwind.config.ts       # Tailwind 配置
```

## 🔧 开发指南

### 添加新组件

使用 shadcn/ui CLI 添加组件：

```bash
# 添加按钮组件
bunx shadcn@latest add button

# 添加卡片组件
bunx shadcn@latest add card
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式声明

### 状态管理

使用 Zustand 进行全局状态管理：

```typescript
import { create } from 'zustand'

interface SystemState {
  cpu: number
  setCpu: (value: number) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  cpu: 0,
  setCpu: (value) => set({ cpu: value })
}))
```

## 🎨 主题定制

项目使用 Tailwind CSS 进行样式管理，支持深色模式。主要配置文件：

- `tailwind.config.ts` - Tailwind 配置
- `src/App.css` - 全局样式

## 📦 构建配置

### Tauri 配置

`src-tauri/tauri.conf.json` 包含：

- 应用窗口尺寸 (800x600)
- 图标配置
- 构建命令
- 平台支持 (Windows, macOS, Linux)

### Vite 配置

`vite.config.ts` 包含：

- React 插件
- Tailwind CSS 插件
- 路径别名配置

## 🔍 故障排除

### 常见问题

1. **Tauri 构建失败**
   - 确保 Rust 工具链已安装
   - 检查系统依赖 (Windows: Visual Studio C++ Build Tools)

2. **Tailwind 样式不生效**
   - 确保 `@tailwind` 指令在 CSS 文件中
   - 检查 `tailwind.config.ts` 配置

3. **类型错误**
   - 运行 `bun run build` 检查 TypeScript 错误
   - 更新依赖版本

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Tauri](https://tauri.app/) - 桌面应用框架
- [React](https://react.dev/) - UI 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件
- [ECharts](https://echarts.apache.org/) - 图表库

---

**开发时间**: 2026-01-28
**版本**: 0.1.0
**作者**: krmeow

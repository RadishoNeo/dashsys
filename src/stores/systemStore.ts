import { create } from 'zustand';
import type { CpuStats, MemoryStats, NetworkStats, ProcessInfo, DiskInfo, SystemInfo, CpuInfo } from '../types/system';

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
  setStatic: (data: Partial<SystemState['static']>) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  realtime: {
    cpu: null,
    memory: null,
    network: null,
    timestamp: 0,
  },
  medium: {
    processes: [],
    disks: [],
  },
  static: {
    systemInfo: null,
    cpuInfo: null,
  },
  
  updateRealtime: (data) => set((state) => ({
    realtime: { ...state.realtime, ...data }
  })),
  updateMedium: (data) => set((state) => ({
    medium: { ...state.medium, ...data }
  })),
  setStatic: (data) => set((state) => ({
    static: { ...state.static, ...data }
  })),
}));

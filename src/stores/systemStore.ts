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
  
  // 历史数据（用于图表）
  history: {
    cpu: number[];
    memory: number[];
    network: { rx: number[]; tx: number[] };
  };
  
  // Actions
  updateRealtime: (data: Partial<SystemState['realtime']>) => void;
  updateMedium: (data: Partial<SystemState['medium']>) => void;
  setStatic: (data: Partial<SystemState['static']>) => void;
  pushHistory: (data: Partial<{
    cpu: number;
    memory: number;
    network: { rx: number; tx: number };
  }>) => void;
}

const MAX_HISTORY_LENGTH = 60;

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
  history: {
    cpu: new Array(MAX_HISTORY_LENGTH).fill(0),
    memory: new Array(MAX_HISTORY_LENGTH).fill(0),
    network: {
      rx: new Array(MAX_HISTORY_LENGTH).fill(0),
      tx: new Array(MAX_HISTORY_LENGTH).fill(0),
    },
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
  pushHistory: (data) => set((state) => {
    const newHistory = { ...state.history };
    
    if (data.cpu !== undefined) {
      newHistory.cpu = [...state.history.cpu.slice(1), data.cpu];
    }
    if (data.memory !== undefined) {
      newHistory.memory = [...state.history.memory.slice(1), data.memory];
    }
    if (data.network) {
      newHistory.network = {
        rx: [...state.history.network.rx.slice(1), data.network.rx],
        tx: [...state.history.network.tx.slice(1), data.network.tx],
      };
    }
    
    return { history: newHistory };
  }),
}));

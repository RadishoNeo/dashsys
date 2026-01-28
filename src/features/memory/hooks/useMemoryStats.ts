import { useCallback, useEffect, useRef } from "react";
import { memoryInfo, refreshMemory } from "tauri-plugin-system-info-api";
import { useSystemStore } from "@/stores/systemStore";
import type { MemoryStats } from "@/types/system";
import { HISTORY_LENGTH, REALTIME_INTERVAL_MS } from "@/lib/constants";

export const useMemoryStats = (interval: number = REALTIME_INTERVAL_MS) => {
  const { realtime, updateRealtime } = useSystemStore();
  const historyRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));

  const fetchStats = useCallback(async () => {
    try {
      await refreshMemory();
      const mem = await memoryInfo();
      const total = mem.total_memory;
      const used = mem.used_memory;
      const available = Math.max(0, total - used);
      const usagePercent = total === 0 ? 0 : (used / total) * 100;

      const data: MemoryStats = {
        total,
        used,
        available,
        free: available,
        swap_total: mem.total_swap,
        swap_used: mem.used_swap,
        usage_percent: usagePercent,
      };

      historyRef.current = [...historyRef.current.slice(1), usagePercent];
      updateRealtime({
        memory: data,
        timestamp: Math.floor(Date.now() / 1000),
      });
    } catch {
      return;
    }
  }, [updateRealtime]);

  useEffect(() => {
    void fetchStats();
    const timer = window.setInterval(() => void fetchStats(), interval);
    return () => window.clearInterval(timer);
  }, [fetchStats, interval]);

  return {
    current: realtime.memory,
    history: historyRef.current,
  };
};


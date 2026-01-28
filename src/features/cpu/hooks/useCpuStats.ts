import { useCallback, useEffect, useRef } from "react";
import { useSystemStore } from "@/stores/systemStore";
import type { CpuStats } from "@/types/system";
import { cpuInfo, refreshCpu } from "tauri-plugin-system-info-api";

const HISTORY_LENGTH = 60;

export const useCpuStats = (interval: number = 1000) => {
  const { realtime, updateRealtime } = useSystemStore();
  const historyRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));

  const fetchStats = useCallback(async () => {
    try {
      await refreshCpu();
      const info = await cpuInfo();

      const perCore = info.cpus.map((c) => c.cpu_usage);
      const usage =
        perCore.length === 0
          ? 0
          : perCore.reduce((sum, v) => sum + v, 0) / perCore.length;
      const frequency =
        info.cpus.length === 0
          ? 0
          : info.cpus.reduce((sum, c) => sum + c.frequency, 0) /
            info.cpus.length;

      const data: CpuStats = {
        usage,
        frequency,
        core_count: info.cpu_count,
        per_core: perCore,
        load_avg: [0, 0, 0],
      };
      const timestamp = Math.floor(Date.now() / 1000);

      // 更新历史数据用于图表
      historyRef.current = [...historyRef.current.slice(1), data.usage];

      updateRealtime({
        cpu: data,
        timestamp,
      });
    } catch (error) {
      console.error("Failed to fetch CPU stats:", error);
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

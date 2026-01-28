import { useSystemStore } from "@/stores/systemStore";

export const useCpuStats = () => {
  const { realtime, history } = useSystemStore();

  return {
    current: realtime.cpu,
    history: history.cpu,
    coreCount: realtime.cpu?.core_count || 0,
    loadAvg: realtime.cpu?.load_avg || [0, 0, 0],
  };
};

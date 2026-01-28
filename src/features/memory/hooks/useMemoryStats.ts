import { useSystemStore } from "@/stores/systemStore";

export const useMemoryStats = () => {
  const { realtime, history } = useSystemStore();

  return {
    current: realtime.memory,
    history: history.memory,
  };
};

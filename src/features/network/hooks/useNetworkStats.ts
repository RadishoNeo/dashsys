import { useSystemStore } from "@/stores/systemStore";

export const useNetworkStats = () => {
  const { realtime, history } = useSystemStore();

  return {
    current: realtime.network,
    rxSpeedHistory: history.network.rx,
    txSpeedHistory: history.network.tx,
  };
};

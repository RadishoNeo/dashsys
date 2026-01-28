import { useCallback, useEffect, useRef } from "react";
import { networks } from "tauri-plugin-system-info-api";
import { useSystemStore } from "@/stores/systemStore";
import type { NetworkStats } from "@/types/system";
import { calculateSpeed } from "@/lib/format";
import { HISTORY_LENGTH, REALTIME_INTERVAL_MS } from "@/lib/constants";
import { bytesPerSecondToMbps } from "../utils";

export const useNetworkStats = (interval: number = REALTIME_INTERVAL_MS) => {
  const { realtime, updateRealtime } = useSystemStore();
  const lastTotalsRef = useRef<{ rx: number; tx: number; ts: number } | null>(null);
  const rxHistoryRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));
  const txHistoryRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));

  const fetchStats = useCallback(async () => {
    try {
      const list = await networks();
      const interfaces = list.map((i) => ({
        name: i.interface_name,
        rx_bytes: i.total_received,
        tx_bytes: i.total_transmitted,
        rx_errors: i.total_errors_on_received,
        tx_errors: i.total_errors_on_transmitted,
      }));

      const totals = interfaces.reduce(
        (acc, i) => ({ rx: acc.rx + i.rx_bytes, tx: acc.tx + i.tx_bytes }),
        { rx: 0, tx: 0 },
      );

      const now = Date.now();
      const last = lastTotalsRef.current;
      const deltaMs = last ? now - last.ts : 0;
      const speedRxBytes = last ? calculateSpeed(totals.rx, last.rx, deltaMs) : 0;
      const speedTxBytes = last ? calculateSpeed(totals.tx, last.tx, deltaMs) : 0;
      lastTotalsRef.current = { rx: totals.rx, tx: totals.tx, ts: now };

      const speedRxMbps = bytesPerSecondToMbps(speedRxBytes);
      const speedTxMbps = bytesPerSecondToMbps(speedTxBytes);

      rxHistoryRef.current = [...rxHistoryRef.current.slice(1), speedRxMbps];
      txHistoryRef.current = [...txHistoryRef.current.slice(1), speedTxMbps];

      const data: NetworkStats = {
        interfaces: interfaces.map((i) => ({
          ...i,
          speed: undefined,
        })),
        total_rx: totals.rx,
        total_tx: totals.tx,
      };

      updateRealtime({
        network: data,
        timestamp: Math.floor(now / 1000),
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
    current: realtime.network,
    rxSpeedHistory: rxHistoryRef.current,
    txSpeedHistory: txHistoryRef.current,
  };
};

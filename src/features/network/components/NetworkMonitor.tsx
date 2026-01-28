import React from "react";
import { Activity } from "lucide-react";
import { useNetworkStats } from "../hooks/useNetworkStats";
import { MetricCard } from "@/components/metrics/MetricCard";
import { RealtimeLineChart } from "@/components/charts/RealtimeLineChart";
import { formatBytes } from "@/lib/format";

export const NetworkMonitor: React.FC = () => {
  const { current, rxSpeedHistory, txSpeedHistory } = useNetworkStats();

  if (!current) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading network stats...</div>;
  }

  const rxMbps = rxSpeedHistory[rxSpeedHistory.length - 1] ?? 0;
  const txMbps = txSpeedHistory[txSpeedHistory.length - 1] ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Download"
          value={`${rxMbps.toFixed(2)} Mbps`}
          subValue={`Total: ${formatBytes(current.total_rx)}`}
          icon={Activity}
        />
        <MetricCard
          title="Upload"
          value={`${txMbps.toFixed(2)} Mbps`}
          subValue={`Total: ${formatBytes(current.total_tx)}`}
          icon={Activity}
        />
        <MetricCard
          title="Interfaces"
          value={current.interfaces.length}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RealtimeLineChart
          title="Download Speed"
          data={rxSpeedHistory}
          maxPoints={rxSpeedHistory.length}
          color="#3b82f6"
          unit="Mbps"
        />
        <RealtimeLineChart
          title="Upload Speed"
          data={txSpeedHistory}
          maxPoints={txSpeedHistory.length}
          color="#f97316"
          unit="Mbps"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          Interfaces
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {current.interfaces.map((i) => (
            <div key={i.name} className="px-4 py-3 text-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-medium text-gray-900 dark:text-white">
                  {i.name}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  RX: {formatBytes(i.rx_bytes)} · TX: {formatBytes(i.tx_bytes)}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Errors RX: {i.rx_errors} · Errors TX: {i.tx_errors}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

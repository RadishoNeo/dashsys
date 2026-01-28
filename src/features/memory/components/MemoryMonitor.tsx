import React from "react";
import { MemoryStick } from "lucide-react";
import { useMemoryStats } from "../hooks/useMemoryStats";
import { MetricCard } from "@/components/metrics/MetricCard";
import { RealtimeLineChart } from "@/components/charts/RealtimeLineChart";
import { formatBytes, formatPercentage } from "@/lib/format";

export const MemoryMonitor: React.FC = () => {
  const { current, history } = useMemoryStats();

  if (!current) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading memory stats...</div>;
  }

  const status =
    current.usage_percent > 90
      ? "danger"
      : current.usage_percent > 75
        ? "warning"
        : "normal";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Memory Usage"
          value={formatPercentage(current.usage_percent)}
          subValue={`${formatBytes(current.used)} / ${formatBytes(current.total)}`}
          icon={MemoryStick}
          status={status}
        />
        <MetricCard
          title="Available"
          value={formatBytes(current.available)}
          icon={MemoryStick}
        />
        <MetricCard
          title="Swap"
          value={`${formatBytes(current.swap_used)} / ${formatBytes(current.swap_total)}`}
          icon={MemoryStick}
        />
      </div>

      <RealtimeLineChart
        title="Memory Usage History"
        data={history}
        maxPoints={history.length}
        color="#10b981"
        unit="%"
      />
    </div>
  );
};

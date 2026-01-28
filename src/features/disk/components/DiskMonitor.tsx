import React from "react";
import { HardDrive } from "lucide-react";
import { useDiskStats } from "../hooks/useDiskStats";
import { MetricCard } from "@/components/metrics/MetricCard";
import { formatBytes, formatPercentage } from "@/lib/format";

export const DiskMonitor: React.FC = () => {
  const { disks } = useDiskStats();

  if (disks.length === 0) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading disk stats...</div>;
  }

  const totalSpace = disks.reduce((sum, d) => sum + d.total_space, 0);
  const usedSpace = disks.reduce((sum, d) => sum + d.used_space, 0);
  const percent = totalSpace === 0 ? 0 : (usedSpace / totalSpace) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Disk Usage"
          value={formatPercentage(percent)}
          subValue={`${formatBytes(usedSpace)} / ${formatBytes(totalSpace)}`}
          icon={HardDrive}
          status={percent > 90 ? "danger" : percent > 75 ? "warning" : "normal"}
        />
        <MetricCard title="Disks" value={disks.length} icon={HardDrive} />
        <MetricCard
          title="Available"
          value={formatBytes(disks.reduce((sum, d) => sum + d.available_space, 0))}
          icon={HardDrive}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {disks.map((d) => (
          <div
            key={`${d.mount_point}-${d.name}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {d.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {d.mount_point} · {d.file_system}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {formatPercentage(d.usage_percent)}
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(100, Math.max(0, d.usage_percent))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(d.used_space)} / {formatBytes(d.total_space)} used
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

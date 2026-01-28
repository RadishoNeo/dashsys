import React from "react";
import { HardDrive } from "lucide-react";
import { useDiskStats } from "../hooks/useDiskStats";
import { MetricCard } from "@/components/metrics/MetricCard";
import { formatBytes, formatPercentage } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const DiskMonitor: React.FC = () => {
  const { disks } = useDiskStats();

  if (disks.length === 0) {
    return <div className="p-4 text-muted-foreground animate-pulse">Loading disk stats...</div>;
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
          <Card key={`${d.mount_point}-${d.name}`} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {d.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.mount_point} · {d.file_system}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatPercentage(d.usage_percent)}
                </div>
              </div>
              <Progress value={d.usage_percent} className="mt-3 h-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                {formatBytes(d.used_space)} / {formatBytes(d.total_space)} used
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryChart } from "./HistoryChart";
import { StatsChart } from "./StatsChart";
import {
  useCpuHistory,
  useMemoryHistory,
  useStats,
} from "@/hooks/useHistoryData";
import type { CpuHistoryRecord, MemoryHistoryRecord } from "@/types/history";

export const HistoryPanel = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("1h");
  const [statsRange, setStatsRange] = useState<"7d" | "30d">("7d");

  const hours = timeRange === "1h" ? 1 : timeRange === "6h" ? 6 : 24;
  const days = statsRange === "7d" ? 7 : 30;

  const cpuHistory = useCpuHistory(hours);
  const memoryHistory = useMemoryHistory(hours);
  const stats = useStats(days);

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            Historical Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="1h">1 Hour</TabsTrigger>
              <TabsTrigger value="6h">6 Hours</TabsTrigger>
              <TabsTrigger value="24h">24 Hours</TabsTrigger>
            </TabsList>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HistoryChart<CpuHistoryRecord>
                data={cpuHistory.data}
                title="CPU Usage History"
                unit="%"
                color="#3B82F6"
                getValue={(d) => d.usage}
                loading={cpuHistory.loading}
              />
              <HistoryChart<MemoryHistoryRecord>
                data={memoryHistory.data}
                title="Memory Usage History"
                unit="%"
                color="#22C55E"
                getValue={(d) => d.usage_percent}
                loading={memoryHistory.loading}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statsRange} onValueChange={(v) => setStatsRange(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
            </TabsList>
            <div className="grid grid-cols-1 gap-4">
              <StatsChart
                data={stats.data?.hourly ?? []}
                title="Hourly Statistics"
                loading={stats.loading}
                isHourly={true}
              />
              <StatsChart
                data={stats.data?.daily ?? []}
                title="Daily Statistics"
                loading={stats.loading}
                isHourly={false}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
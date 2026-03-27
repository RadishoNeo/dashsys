import ReactECharts from "echarts-for-react";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HourlyStats, DailyStats } from "@/types/history";
import { format } from "date-fns";

interface StatsChartProps {
  data: HourlyStats[] | DailyStats[];
  title: string;
  loading?: boolean;
  isHourly?: boolean;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  data,
  title,
  loading,
  isHourly = true,
}) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No stats data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const timestamps = data.map((d) =>
    format(
      new Date(
        (isHourly
          ? (d as HourlyStats).hour_timestamp
          : (d as DailyStats).day_timestamp) * 1000
      ),
      isHourly ? "MM-dd HH:mm" : "MM-dd"
    )
  );

  const option = {
    backgroundColor: "transparent",
    legend: {
      data: ["Avg CPU", "Max CPU", "Avg Memory", "Max Memory"],
      textStyle: { color: isDark ? "#94A3B8" : "#6b7280" },
      top: 0,
    },
    grid: { top: 50, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: "category",
      data: timestamps,
      axisLabel: {
        color: isDark ? "#94A3B8" : "#6b7280",
        fontSize: 10,
        interval: Math.floor(data.length / 6),
      },
    },
    yAxis: {
      type: "value",
      max: 100,
      splitLine: {
        lineStyle: { color: isDark ? "#334155" : "#e5e7eb" },
      },
      axisLabel: { color: isDark ? "#94A3B8" : "#6b7280" },
    },
    series: [
      {
        name: "Avg CPU",
        type: "line",
        smooth: true,
        symbol: "none",
        data: data.map((d) => d.avg_cpu_usage),
        lineStyle: { color: "#3B82F6", width: 2 },
      },
      {
        name: "Max CPU",
        type: "line",
        smooth: true,
        symbol: "none",
        data: data.map((d) => d.max_cpu_usage),
        lineStyle: { color: "#EF4444", width: 1 },
      },
      {
        name: "Avg Memory",
        type: "line",
        smooth: true,
        symbol: "none",
        data: data.map((d) => d.avg_memory_usage),
        lineStyle: { color: "#22C55E", width: 2 },
      },
      {
        name: "Max Memory",
        type: "line",
        smooth: true,
        symbol: "none",
        data: data.map((d) => d.max_memory_usage),
        lineStyle: { color: "#F97316", width: 1 },
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#1E293B" : "#ffffff",
      borderColor: isDark ? "#334155" : "#e5e7eb",
      textStyle: { color: isDark ? "#F8FAFC" : "#1f2937" },
    },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 300 }} />
      </CardContent>
    </Card>
  );
};
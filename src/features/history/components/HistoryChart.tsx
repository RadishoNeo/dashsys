import ReactECharts from "echarts-for-react";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CpuHistoryRecord, MemoryHistoryRecord } from "@/types/history";
import { format } from "date-fns";

interface HistoryChartProps<T extends { timestamp: number }> {
  data: T[];
  title: string;
  unit: string;
  color: string;
  getValue: (item: T) => number;
  loading?: boolean;
}

export const HistoryChart = <T extends { timestamp: number }>({
  data,
  title,
  unit,
  color,
  getValue,
  loading,
}: HistoryChartProps<T>) => {
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
            No historical data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const timestamps = data.map((d) =>
    format(new Date(d.timestamp * 1000), "HH:mm:ss")
  );
  const values = data.map(getValue);

  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 20, bottom: 40, left: 50 },
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
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + "40" },
              { offset: 1, color: color + "00" },
            ],
          },
        },
        lineStyle: { color, width: 2 },
        data: values,
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#1E293B" : "#ffffff",
      borderColor: isDark ? "#334155" : "#e5e7eb",
      textStyle: { color: isDark ? "#F8FAFC" : "#1f2937" },
      formatter: (params: any) => {
        const point = params[0];
        return `${point.name}<br/>${point.value.toFixed(1)}${unit}`;
      },
    },
  };

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 200 }} />
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground font-mono">
          <div>Avg: {avg.toFixed(1)}{unit}</div>
          <div>Max: {max.toFixed(1)}{unit}</div>
          <div>Min: {min.toFixed(1)}{unit}</div>
        </div>
      </CardContent>
    </Card>
  );
};
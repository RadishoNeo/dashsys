import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: number[];
  maxPoints?: number;
  color?: string;
  unit?: string;
  title: string;
}

export const RealtimeLineChart: React.FC<Props> = ({
  data, maxPoints = 60, color = '#22C55E', unit = '%', title
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current, isDark ? 'dark' : undefined, {
      renderer: 'canvas'
    });

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: { top: 40, right: 20, bottom: 20, left: 40 },
      xAxis: {
        type: 'category',
        show: false,
        data: [],
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: isDark ? '#334155' : '#e5e7eb' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#6b7280' }
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '40' },
            { offset: 1, color: color + '00' },
          ])
        },
        lineStyle: { color, width: 2 },
        data: [],
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e5e7eb',
        textStyle: { color: isDark ? '#F8FAFC' : '#1f2937' }
      },
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [maxPoints, color, isDark]);

  useEffect(() => {
    if (!chartInstance.current) return;

    const points = data.slice(-maxPoints);
    chartInstance.current.setOption({
      xAxis: { data: points.map((_, i) => String(i)) },
      series: [{ data: points }],
    });
  }, [data, maxPoints]);

  const current = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-48" />
        <div className="mt-2 text-right text-xs text-muted-foreground font-mono">
          Current: {current === null ? '--' : current.toFixed(1)}{unit}
        </div>
      </CardContent>
    </Card>
  );
};

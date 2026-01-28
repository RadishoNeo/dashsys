import React from "react";
import { Cpu } from "lucide-react";
import { MetricCard } from "@/components/metrics/MetricCard";
import { formatCpuFrequency } from "../utils";

interface Props {
  coreCount: number;
  loadAvg: [number, number, number];
  frequencyMHz: number;
}

export const CpuDetail: React.FC<Props> = ({ coreCount, loadAvg, frequencyMHz }) => {
  return (
    <>
      <MetricCard
        title="Load Average (1m)"
        value={loadAvg[0].toFixed(2)}
        subValue={`5m: ${loadAvg[1].toFixed(2)} | 15m: ${loadAvg[2].toFixed(2)}`}
        icon={Cpu}
      />
      <MetricCard
        title="Frequency"
        value={formatCpuFrequency(frequencyMHz)}
        subValue={`${coreCount} Cores`}
        icon={Cpu}
      />
    </>
  );
};


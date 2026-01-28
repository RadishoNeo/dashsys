import React from "react";
import { Cpu } from "lucide-react";
import { useCpuStats } from "../hooks/useCpuStats";
import { MetricCard } from "@/components/metrics/MetricCard";
import { formatPercentage } from "@/lib/format";
import { CpuChart } from "./CpuChart";
import { CoreGrid } from "./CoreGrid";
import { CpuDetail } from "./CpuDetail";

export const CpuMonitor: React.FC = () => {
    const { current, history, coreCount, loadAvg } = useCpuStats();

    if (!current) return <div className="p-4 text-muted-foreground animate-pulse">Loading CPU stats...</div>;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="CPU Usage"
                    value={formatPercentage(current.usage)}
                    subValue={`${coreCount} Cores`}
                    icon={Cpu}
                    status={current.usage > 90 ? 'danger' : current.usage > 70 ? 'warning' : 'normal'}
                />
                <CpuDetail coreCount={coreCount} loadAvg={loadAvg} frequencyMHz={current.frequency} />
            </div>

            <CoreGrid perCore={current.per_core} />
            <CpuChart history={history} />
        </div>
    );
};

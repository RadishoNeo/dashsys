import React from "react";
import { RealtimeLineChart } from "@/components/charts/RealtimeLineChart";

interface Props {
  history: number[];
}

export const CpuChart: React.FC<Props> = ({ history }) => {
  return (
    <RealtimeLineChart
      title="CPU Usage History"
      data={history}
      maxPoints={history.length}
      color="#3b82f6"
      unit="%"
    />
  );
};


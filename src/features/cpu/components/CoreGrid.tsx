import React from "react";
import { formatPercentage } from "@/lib/format";

interface Props {
  perCore: number[];
}

export const CoreGrid: React.FC<Props> = ({ perCore }) => {
  return (
    <div className="rounded-lg border border-secondary bg-surface p-4 shadow-sm">
      <div className="text-sm font-semibold text-text uppercase tracking-wider">
        Cores
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {perCore.map((u, idx) => (
          <div key={idx} className="rounded-md bg-background/50 p-3 ring-1 ring-secondary/50">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2">
              <span className="font-mono">Core {idx + 1}</span>
              <span className="font-medium font-mono">{formatPercentage(u)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-cta transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, u))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


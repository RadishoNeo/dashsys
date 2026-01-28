import React from "react";
import { formatPercentage } from "@/lib/format";

interface Props {
  perCore: number[];
}

export const CoreGrid: React.FC<Props> = ({ perCore }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        Cores
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {perCore.map((u, idx) => (
          <div key={idx} className="rounded-md bg-gray-50 p-3 dark:bg-gray-900/30">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Core {idx + 1}</span>
              <span className="font-medium">{formatPercentage(u)}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(100, Math.max(0, u))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


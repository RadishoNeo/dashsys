import React from "react";
import { formatPercentage } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  perCore: number[];
}

export const CoreGrid: React.FC<Props> = ({ perCore }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">Cores</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {perCore.map((u, idx) => (
          <div key={idx} className="rounded-md bg-muted/50 p-3 ring-1 ring-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-mono">Core {idx + 1}</span>
              <span className="font-medium font-mono">{formatPercentage(u)}</span>
            </div>
            <Progress value={u} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};


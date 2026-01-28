import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'danger';
}

export const MetricCard: React.FC<Props> = ({
  title, value, subValue, icon: Icon, status = 'normal'
}) => {
  const statusColors = {
    normal: 'border-l-4 border-l-cta shadow-cta/5',
    warning: 'border-l-4 border-l-yellow-500 shadow-yellow-500/5',
    danger: 'border-l-4 border-l-red-500 shadow-red-500/5',
  };

  return (
    <Card className={cn("transition-all duration-200 hover:translate-y-[-2px] shadow-md", statusColors[status])}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 font-mono">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </CardContent>
    </Card>
  );
};

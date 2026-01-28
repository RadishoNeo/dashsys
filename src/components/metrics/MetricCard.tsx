import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    normal: 'border-l-4 border-cta bg-surface shadow-md shadow-cta/5',
    warning: 'border-l-4 border-yellow-500 bg-surface shadow-md shadow-yellow-500/5',
    danger: 'border-l-4 border-red-500 bg-surface shadow-md shadow-red-500/5',
  };

  return (
    <div className={`p-4 rounded-lg transition-all duration-200 hover:translate-y-[-2px] ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-text mt-1 font-mono">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-text-muted mt-1">{subValue}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-cta/80" />
      </div>
    </div>
  );
};

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
    normal: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-800 dark:border-blue-400',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-gray-800 dark:border-yellow-400',
    danger: 'border-l-4 border-red-500 bg-red-50 dark:bg-gray-800 dark:border-red-400',
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );
};

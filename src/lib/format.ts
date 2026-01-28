
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + '%';
};

// 计算每秒速率 (用于网络)
export const calculateSpeed = (
  currentBytes: number, 
  lastBytes: number, 
  timeDeltaMs: number
): number => {
  if (timeDeltaMs === 0) return 0;
  return ((currentBytes - lastBytes) * 1000) / timeDeltaMs; // bytes/s
};

export const bytesPerSecondToMbps = (bytesPerSecond: number) => {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return 0;
  return (bytesPerSecond * 8) / 1_000_000;
};

export const formatCpuFrequency = (mhz: number) => {
  if (!Number.isFinite(mhz) || mhz <= 0) return "--";
  return `${(mhz / 1000).toFixed(2)} GHz`;
};


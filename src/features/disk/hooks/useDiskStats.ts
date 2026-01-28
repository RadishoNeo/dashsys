import { useSystemStore } from "@/stores/systemStore";

export const useDiskStats = () => {
  const { medium } = useSystemStore();
  return { disks: medium.disks };
};

import { useCallback, useEffect } from "react";
import { disks } from "tauri-plugin-system-info-api";
import { useSystemStore } from "@/stores/systemStore";
import type { DiskInfo } from "@/types/system";
import { MEDIUM_INTERVAL_MS } from "@/lib/constants";

export const useDiskStats = (interval: number = MEDIUM_INTERVAL_MS) => {
  const { medium, updateMedium } = useSystemStore();

  const fetchDisks = useCallback(async () => {
    try {
      const list = await disks();
      const mapped: DiskInfo[] = list.map((d) => {
        const used = Math.max(0, d.total_space - d.available_space);
        return {
          name: d.name,
          mount_point: d.mount_point,
          total_space: d.total_space,
          available_space: d.available_space,
          used_space: used,
          file_system: d.file_system,
          is_removable: d.is_removable,
          usage_percent: d.total_space === 0 ? 0 : (used / d.total_space) * 100,
        };
      });
      updateMedium({ disks: mapped });
    } catch {
      return;
    }
  }, [updateMedium]);

  useEffect(() => {
    void fetchDisks();
    const timer = window.setInterval(() => void fetchDisks(), interval);
    return () => window.clearInterval(timer);
  }, [fetchDisks, interval]);

  return { disks: medium.disks };
};


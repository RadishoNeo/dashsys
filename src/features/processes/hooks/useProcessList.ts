import { useCallback, useEffect, useMemo, useState } from "react";
import { processes, refreshProcesses } from "tauri-plugin-system-info-api";
import { useSystemStore } from "@/stores/systemStore";
import type { ProcessInfo } from "@/types/system";
import { MEDIUM_INTERVAL_MS } from "@/lib/constants";
import { invokeCommand } from "@/lib/tauri";

const mapStatus = (status: string): ProcessInfo["status"] => {
  if (status === "Sleep") return "Sleeping";
  if (status === "Stop") return "Stopped";
  if (status === "Zombie") return "Zombie";
  return "Running";
};

export const useProcessList = () => {
  const { medium, updateMedium } = useSystemStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      await refreshProcesses();
      const list = await processes();
      const mapped: ProcessInfo[] = list.map((p) => ({
        pid: p.pid,
        name: p.name,
        status: mapStatus(typeof p.status === "string" ? p.status : "Unknown"),
        cpu_usage: p.cpu_usage,
        memory: p.memory,
        virtual_memory: p.virtual_memory,
        disk_read: p.disk_usage.total_read_bytes,
        disk_written: p.disk_usage.total_written_bytes,
        parent: p.parent ?? undefined,
        command: p.cmd.length ? p.cmd.join(" ") : undefined,
      }));
      updateMedium({ processes: mapped });
    } finally {
      setLoading(false);
    }
  }, [updateMedium]);

  // Remove automatic interval as it is handled by useSystemStats

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medium.processes;
    return medium.processes.filter((p) => {
      if (String(p.pid).includes(q)) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      return p.command?.toLowerCase().includes(q) ?? false;
    });
  }, [medium.processes, query]);

  const killProcess = useCallback(async (pid: number) => {
    await invokeCommand<void>("kill_process", { pid });
    await fetchList();
  }, [fetchList]);

  return {
    processes: filtered,
    query,
    setQuery,
    loading,
    refresh: fetchList,
    killProcess,
  };
};


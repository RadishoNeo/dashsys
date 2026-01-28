import { useEffect, useRef } from "react";
import {
  cpuInfo,
  memoryInfo,
  networks,
  processes,
  disks,
  refreshCpu,
  refreshMemory,
  refreshProcesses,
  staticInfo,
} from "tauri-plugin-system-info-api";
import { useSystemStore } from "@/stores/systemStore";
import type {
  DiskInfo,
  MemoryStats,
  NetworkStats,
  ProcessInfo,
  SystemInfo,
} from "@/types/system";
import { calculateSpeed } from "@/lib/format";
import { MEDIUM_INTERVAL_MS, REALTIME_INTERVAL_MS } from "@/lib/constants";

const mapProcessStatus = (
  status: string,
): "Running" | "Sleeping" | "Stopped" | "Zombie" => {
  if (status === "Sleep") return "Sleeping";
  if (status === "Stop") return "Stopped";
  if (status === "Zombie") return "Zombie";
  return "Running";
};

export const useSystemStats = () => {
  const { updateRealtime, updateMedium, setStatic, pushHistory } =
    useSystemStore();
  const lastNetworkTotalsRef = useRef<{
    rx: number;
    tx: number;
    ts: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadStatic = async () => {
      const info = await staticInfo();
      const sys: SystemInfo = {
        hostname: info.hostname ?? "unknown",
        os_name: info.name ?? "unknown",
        os_version: info.os_version ?? "unknown",
        kernel_version: info.kernel_version ?? "unknown",
        arch: "unknown",
        uptime: 0,
      };
      if (mounted) setStatic({ systemInfo: sys });
    };

    const tickRealtime = async () => {
      await Promise.all([refreshCpu(), refreshMemory()]);

      const [cpu, mem, net] = await Promise.all([
        cpuInfo(),
        memoryInfo(),
        networks(),
      ]);

      const perCore = cpu.cpus.map((c) => c.cpu_usage);
      const usage =
        perCore.length === 0
          ? 0
          : perCore.reduce((sum, v) => sum + v, 0) / perCore.length;
      const frequency =
        cpu.cpus.length === 0
          ? 0
          : cpu.cpus.reduce((sum, c) => sum + c.frequency, 0) / cpu.cpus.length;

      const memory: MemoryStats = {
        total: mem.total_memory,
        used: mem.used_memory,
        available: Math.max(0, mem.total_memory - mem.used_memory),
        free: Math.max(0, mem.total_memory - mem.used_memory),
        swap_total: mem.total_swap,
        swap_used: mem.used_swap,
        usage_percent:
          mem.total_memory === 0
            ? 0
            : (mem.used_memory / mem.total_memory) * 100,
      };

      const interfaces = net.map((i) => ({
        name: i.interface_name,
        rx_bytes: i.total_received,
        tx_bytes: i.total_transmitted,
        rx_errors: i.total_errors_on_received,
        tx_errors: i.total_errors_on_transmitted,
      }));

      const totals = interfaces.reduce(
        (acc, i) => ({
          rx: acc.rx + i.rx_bytes,
          tx: acc.tx + i.tx_bytes,
        }),
        { rx: 0, tx: 0 },
      );

      const now = Date.now();
      const last = lastNetworkTotalsRef.current;
      const deltaMs = last ? now - last.ts : 0;
      const speedRx = last ? calculateSpeed(totals.rx, last.rx, deltaMs) : 0;
      const speedTx = last ? calculateSpeed(totals.tx, last.tx, deltaMs) : 0;
      lastNetworkTotalsRef.current = { rx: totals.rx, tx: totals.tx, ts: now };

      if (mounted) {
        pushHistory({
          cpu: usage,
          memory: memory.usage_percent,
          network: {
            rx: (speedRx * 8) / 1_000_000,
            tx: (speedTx * 8) / 1_000_000,
          },
        });
      }

      const network: NetworkStats = {
        interfaces: interfaces.map((i) => ({
          ...i,
          speed:
            i.name === interfaces[0]?.name
              ? ((speedRx + speedTx) * 8) / 1_000_000
              : undefined,
        })),
        total_rx: totals.rx,
        total_tx: totals.tx,
      };

      if (!mounted) return;
      updateRealtime({
        cpu: {
          usage,
          frequency,
          core_count: cpu.cpu_count,
          per_core: perCore,
          load_avg: [0, 0, 0],
        },
        memory,
        network,
        timestamp: Math.floor(now / 1000),
      });
    };

    const tickMedium = async () => {
      await refreshProcesses();
      const [procList, diskList] = await Promise.all([processes(), disks()]);

      const mappedProcesses: ProcessInfo[] = procList.map((p) => ({
        pid: p.pid,
        name: p.name,
        status: mapProcessStatus(
          typeof p.status === "string" ? p.status : "Unknown",
        ),
        cpu_usage: p.cpu_usage,
        memory: p.memory,
        virtual_memory: p.virtual_memory,
        disk_read: p.disk_usage.total_read_bytes,
        disk_written: p.disk_usage.total_written_bytes,
        parent: p.parent ?? undefined,
        command: p.cmd.length ? p.cmd.join(" ") : undefined,
      }));

      const mappedDisks: DiskInfo[] = diskList.map((d) => {
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

      if (!mounted) return;
      updateMedium({ processes: mappedProcesses, disks: mappedDisks });
    };

    const safe = async (fn: () => Promise<void>) => {
      try {
        await fn();
      } catch {
        return;
      }
    };

    safe(loadStatic);
    safe(tickRealtime);
    safe(tickMedium);

    const realtimeTimer = window.setInterval(
      () => void safe(tickRealtime),
      REALTIME_INTERVAL_MS,
    );
    const mediumTimer = window.setInterval(
      () => void safe(tickMedium),
      MEDIUM_INTERVAL_MS,
    );

    return () => {
      mounted = false;
      window.clearInterval(realtimeTimer);
      window.clearInterval(mediumTimer);
    };
  }, [setStatic, updateMedium, updateRealtime]);
};

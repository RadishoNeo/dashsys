import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  CpuHistoryRecord,
  MemoryHistoryRecord,
  NetworkHistoryRecord,
  DiskHistoryRecord,
  HistoryDataResponse,
  StatsResponse,
} from "@/types/history";

export const useCpuHistory = (hours: number = 1) => {
  const [data, setData] = useState<CpuHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<CpuHistoryRecord[]>("get_cpu_history", {
        hours,
      });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
};

export const useMemoryHistory = (hours: number = 1) => {
  const [data, setData] = useState<MemoryHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<MemoryHistoryRecord[]>("get_memory_history", {
        hours,
      });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
};

export const useNetworkHistory = (hours: number = 1) => {
  const [data, setData] = useState<NetworkHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<NetworkHistoryRecord[]>(
        "get_network_history",
        { hours }
      );
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
};

export const useDiskHistory = (hours: number = 1) => {
  const [data, setData] = useState<DiskHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<DiskHistoryRecord[]>("get_disk_history", {
        hours,
      });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
};

export const useAllHistory = (hours: number = 1) => {
  const [data, setData] = useState<HistoryDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<HistoryDataResponse>("get_all_history", {
        hours,
      });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
};

export const useStats = (days: number = 7) => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoke<StatsResponse>("get_stats", { days });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

export const saveHistoryData = async (data: {
  cpu?: {
    usage: number;
    frequency: number;
    per_core: number[];
  };
  memory?: {
    usage_percent: number;
    used_bytes: number;
    available_bytes: number;
    swap_used_bytes: number;
    swap_total_bytes: number;
  };
  network?: {
    interface_name: string;
    rx_bytes: number;
    tx_bytes: number;
    rx_speed: number;
    tx_speed: number;
  };
  disk?: {
    disk_name: string;
    read_speed: number;
    write_speed: number;
    usage_percent: number;
  };
}): Promise<string> => {
  return invoke("save_history_data", { request: data });
};

export const cleanupOldData = async (): Promise<string> => {
  return invoke("cleanup_old_data");
};

export const aggregateHourly = async (): Promise<string> => {
  return invoke("aggregate_hourly");
};
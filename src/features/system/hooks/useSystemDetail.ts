import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DetailedSystemInfo } from '@/types/system';

export const useSystemDetail = () => {
  const [data, setData] = useState<DetailedSystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await invoke<DetailedSystemInfo>('get_detailed_system_info');
      setData(info);
    } catch (err) {
      console.error('Failed to fetch system info:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  return { data, loading, error, refetch: fetchSystemInfo };
};

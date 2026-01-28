import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useRealtimeUpdate = <T>(
  command: string,
  interval: number = 1000
) => {
  const [data, setData] = useState<T | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await invoke<T>(command);
        if (mounted) setData(result);
      } catch (error) {
        console.error(`Error fetching data from ${command}:`, error);
      }
    };
    
    fetch();
    const timer = setInterval(fetch, interval);
    return () => { mounted = false; clearInterval(timer); };
  }, [command, interval]);
  
  return data;
};

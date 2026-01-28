import { useCallback, useState } from "react";
import { invokeCommand } from "@/lib/tauri";

export const useTauriCommand = <TData, TArgs extends Record<string, unknown> | undefined = undefined>(
  command: string,
) => {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (args?: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await invokeCommand<TData>(command, args as Record<string, unknown> | undefined);
        setData(result);
        return result;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [command],
  );

  return { data, error, loading, run };
};


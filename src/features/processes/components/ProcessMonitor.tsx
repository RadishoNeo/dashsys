import React from "react";
import { ShieldX, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useProcessList } from "../hooks/useProcessList";
import { formatBytes, formatPercentage } from "@/lib/format";

export const ProcessMonitor: React.FC = () => {
  const { processes, query, setQuery, loading, refresh, killProcess } = useProcessList();

  const onKill = async (pid: number) => {
    try {
      await killProcess(pid);
      toast.success(`Killed process ${pid}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pid/name/command"
            className="w-full rounded-md border border-secondary bg-surface px-3 py-2 text-sm text-text placeholder-text-muted shadow-sm focus:border-cta focus:ring-1 focus:ring-cta outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-surface px-3 py-2 text-sm font-medium text-text-muted shadow-sm ring-1 ring-secondary hover:bg-secondary/50 hover:text-text transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-lg border border-secondary bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-secondary px-4 py-3 text-sm font-semibold text-text">
          Processes ({processes.length}) {loading ? "…" : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/20 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">PID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">CPU</th>
                <th className="px-4 py-3 font-medium">Memory</th>
                <th className="px-4 py-3 font-medium">Disk R/W</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {processes.map((p) => (
                <tr key={p.pid} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text">
                    {p.pid}
                  </td>
                  <td className="px-4 py-3 max-w-75">
                    <div className="font-medium text-text truncate" title={p.name}>
                      {p.name}
                    </div>
                    {p.command ? (
                      <div className="mt-1 truncate text-xs text-text-muted" title={p.command}>
                        {p.command}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {p.status}
                  </td>
                  <td className="px-4 py-3 text-text font-mono">
                    {formatPercentage(p.cpu_usage)}
                  </td>
                  <td className="px-4 py-3 text-text font-mono">
                    {formatBytes(p.memory)}
                  </td>
                  <td className="px-4 py-3 text-text font-mono">
                    {formatBytes(p.disk_read)} / {formatBytes(p.disk_written)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void onKill(p.pid)}
                      className="inline-flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                    >
                      <ShieldX className="h-4 w-4" />
                      Kill
                    </button>
                  </td>
                </tr>
              ))}
              {processes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No processes
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


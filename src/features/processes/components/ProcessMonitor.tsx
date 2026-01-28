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
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          Processes ({processes.length}) {loading ? "…" : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/30 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">CPU</th>
                <th className="px-4 py-3">Memory</th>
                <th className="px-4 py-3">Disk R/W</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processes.map((p) => (
                <tr key={p.pid} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                    {p.pid}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {p.name}
                    </div>
                    {p.command ? (
                      <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {p.command}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    {p.status}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    {formatPercentage(p.cpu_usage)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    {formatBytes(p.memory)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    {formatBytes(p.disk_read)} / {formatBytes(p.disk_written)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void onKill(p.pid)}
                      className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
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


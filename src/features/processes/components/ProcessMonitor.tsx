import React from "react";
import { ShieldX, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useProcessList } from "../hooks/useProcessList";
import { formatBytes, formatPercentage } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pid/name/command"
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => void refresh()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-semibold">Processes ({processes.length}) {loading ? "…" : ""}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-20">PID</TableHead>
                  <TableHead className="max-w-75">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Disk R/W</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((p) => (
                  <TableRow key={p.pid}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.pid}
                    </TableCell>
                    <TableCell className="max-w-75">
                      <div className="font-medium truncate" title={p.name}>
                        {p.name}
                      </div>
                      {p.command ? (
                        <div className="mt-1 truncate text-xs text-muted-foreground" title={p.command}>
                          {p.command}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {p.status}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPercentage(p.cpu_usage)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatBytes(p.memory)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatBytes(p.disk_read)} / {formatBytes(p.disk_written)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void onKill(p.pid)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2"
                      >
                        <ShieldX className="h-4 w-4 mr-2" />
                        Kill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {processes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No processes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


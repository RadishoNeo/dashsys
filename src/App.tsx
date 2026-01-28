import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { CpuMonitor } from "@/features/cpu";
import { MemoryMonitor } from "@/features/memory";
import { DiskMonitor } from "@/features/disk";
import { NetworkMonitor } from "@/features/network";
import { ProcessMonitor } from "@/features/processes";
import { SystemDetail } from "@/features/system";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionTabs, type SectionKey } from "@/components/layout/SectionTabs";
import { useSystemStats } from "@/hooks/useSystemStats";

function App() {
  useSystemStats();
  const [section, setSection] = useState<SectionKey>("cpu");

  const tabs = useMemo(
    () => [
      { key: "cpu" as const, label: "CPU" },
      { key: "memory" as const, label: "Memory" },
      { key: "disk" as const, label: "Disk" },
      { key: "network" as const, label: "Network" },
      { key: "processes" as const, label: "Processes" },
      { key: "system" as const, label: "System Info" },
    ],
    [],
  );

  return (
    <AppLayout title="System Dashboard">
      <div className="space-y-4">
        <SectionTabs value={section} onChange={setSection} tabs={tabs} />
        {section === "cpu" ? <CpuMonitor /> : null}
        {section === "memory" ? <MemoryMonitor /> : null}
        {section === "disk" ? <DiskMonitor /> : null}
        {section === "network" ? <NetworkMonitor /> : null}
        {section === "processes" ? <ProcessMonitor /> : null}
        {section === "system" ? <SystemDetail /> : null}
      </div>
      <Toaster />
    </AppLayout>
  );
}

export default App;

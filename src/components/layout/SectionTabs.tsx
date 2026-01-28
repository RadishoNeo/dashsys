import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SectionKey = "cpu" | "memory" | "disk" | "network" | "processes" | "system";

interface Tab {
  key: SectionKey;
  label: string;
}

interface Props {
  value: SectionKey;
  onChange: (key: SectionKey) => void;
  tabs: Tab[];
}

export const SectionTabs: React.FC<Props> = ({ value, onChange, tabs }) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SectionKey)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};


import React from "react";

export type SectionKey = "cpu" | "memory" | "disk" | "network" | "processes";

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
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={
              active
                ? "rounded-md bg-cta px-3 py-2 text-sm font-medium text-white shadow-md shadow-cta/20 transition-all duration-200"
                : "rounded-md bg-surface px-3 py-2 text-sm font-medium text-text-muted ring-1 ring-secondary hover:bg-secondary/50 hover:text-text transition-colors duration-200"
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};


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
                ? "rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};


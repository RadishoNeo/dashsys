import React, { useEffect } from "react";
import { useSettingsStore, type ThemeMode } from "@/stores/settingsStore";

interface Props {
  title: string;
  children: React.ReactNode;
}

const applyThemeToDom = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.classList.remove("dark");
  root.classList.remove("light");
  if (theme === "dark") root.classList.add("dark");
  if (theme === "light") root.classList.add("light");
};

export const AppLayout: React.FC<Props> = ({ title, children }) => {
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-text">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeMode)}
              className="rounded-md border border-secondary bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-cta focus:ring-1 focus:ring-cta outline-none"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};


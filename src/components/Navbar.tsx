import React from "react";
import {
  Folder,
  GitBranch,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Layers,
  Sparkles,
  Terminal,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { ACCENT_COLORS } from "../utils/accentColors";
import { ThemeConfig } from "../types/skill";

interface NavbarProps {
  storagePath: string;
  themeConfig: ThemeConfig;
  onUpdateTheme: (config: Partial<ThemeConfig>) => void;
  gitBranch: string;
  lastGitSync?: string;
  onSyncGit: () => void;
  isSyncingGit: boolean;
  totalSkillsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  storagePath,
  themeConfig,
  onUpdateTheme,
  gitBranch,
  lastGitSync,
  onSyncGit,
  isSyncingGit,
  totalSkillsCount,
}) => {
  const accent = ACCENT_COLORS[themeConfig.accent] || ACCENT_COLORS.indigo;

  const toggleThemeMode = () => {
    const modes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(themeConfig.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onUpdateTheme({ mode: nextMode });
  };

  return (
    <header className="h-12 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Storage Path & Directory Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 truncate max-w-md">
          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate opacity-90">{storagePath}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {totalSkillsCount}
          </span>
          <span>skills salvas</span>
        </div>
      </div>

      {/* Right: Git Status, Sync, Theme Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Git Sync Button */}
        <button
          onClick={onSyncGit}
          disabled={isSyncingGit}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50`}
          title={`Sincronizar Git (${gitBranch})`}
        >
          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline font-mono text-[11px]">{gitBranch}</span>
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-500 ${isSyncingGit ? "animate-spin text-indigo-500" : ""}`}
          />
        </button>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleThemeMode}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title={`Tema Atual: ${
            themeConfig.mode === "light"
              ? "Claro"
              : themeConfig.mode === "dark"
              ? "Escuro"
              : "Sistema"
          }`}
        >
          {themeConfig.mode === "light" && <Sun className="w-4 h-4 text-amber-500" />}
          {themeConfig.mode === "dark" && <Moon className="w-4 h-4 text-indigo-400" />}
          {themeConfig.mode === "system" && <Laptop className="w-4 h-4 text-cyan-500" />}
        </button>
      </div>
    </header>
  );
};

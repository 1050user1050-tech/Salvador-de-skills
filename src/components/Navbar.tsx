import React from "react";
import {
  Folder,
  GitBranch,
  RefreshCw,
  Layers,
  Palette,
  Settings
} from "lucide-react";

interface NavbarProps {
  storagePath: string;
  gitBranch: string;
  lastGitSync?: string;
  onSyncGit: () => void;
  isSyncingGit: boolean;
  totalSkillsCount: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  storagePath,
  gitBranch,
  lastGitSync,
  onSyncGit,
  isSyncingGit,
  totalSkillsCount,
  onOpenSettings,
}) => {
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

      {/* Right: Git Status, Sync, Settings & Color Personalization Button */}
      <div className="flex items-center gap-2">
        {/* Git Sync Button */}
        <button
          onClick={onSyncGit}
          disabled={isSyncingGit}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          title={`Sincronizar Git (${gitBranch})`}
        >
          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline font-mono text-[11px]">{gitBranch}</span>
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-500 ${isSyncingGit ? "animate-spin text-indigo-500" : ""}`}
          />
        </button>

        {/* Settings & Color Personalization Button (Replaces buggy theme button) */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shadow-2xs"
          title="Abrir Configurações e Personalização de Cores"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aparência & Cores</span>
        </button>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from "react";
import {
  Search,
  FolderPlus,
  FilePlus,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GitBranch,
  X,
  Filter
} from "lucide-react";
import { FileTreeNode, GitConfig, Skill } from "../types/skill";
import { FolderTree } from "./FolderTree";
import { ACCENT_COLORS } from "../utils/accentColors";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  tree: FileTreeNode[];
  selectedSkillId: string | null;
  selectedFolderPath: string;
  accentColor: keyof typeof ACCENT_COLORS;
  gitConfig?: GitConfig | null;
  onGoToDashboard?: () => void;
  onSelectSkill: (skill: Skill, relativePath: string) => void;
  onSelectFolder: (folderPath: string) => void;
  onCreateSkillInFolder: (folderRelativePath: string) => void;
  onCreateSubfolder: (parentFolderRelativePath: string) => void;
  onRenameItem: (relativePath: string, name: string, type: "file" | "folder") => void;
  onDeleteItem: (relativePath: string, type: "file" | "folder", displayName?: string) => void;
  onOpenSettings: () => void;
  onOpenNewSkillModal: () => void;
  onOpenNewFolderModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  tree,
  selectedSkillId,
  selectedFolderPath,
  accentColor,
  gitConfig,
  onGoToDashboard,
  onSelectSkill,
  onSelectFolder,
  onCreateSkillInFolder,
  onCreateSubfolder,
  onRenameItem,
  onDeleteItem,
  onOpenSettings,
  onOpenNewSkillModal,
  onOpenNewFolderModal,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  // Collect all unique tags across all JSON skills
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    const extractTags = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.type === "file" && n.data?.tags) {
          n.data.tags.forEach((t) => tagsSet.add(t));
        }
        if (n.children) extractTags(n.children);
      });
    };
    extractTags(tree);
    return Array.from(tagsSet).sort();
  }, [tree]);

  if (isCollapsed) {
    return (
      <div className="w-14 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-3 gap-4 shrink-0 transition-all duration-300 z-20">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          title="Expandir Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />

        <button
          onClick={onOpenNewSkillModal}
          className={`p-2.5 rounded-xl text-white shadow-sm ${accent.primaryBg} transition transform active:scale-95`}
          title="Nova Skill"
        >
          <FilePlus className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenNewFolderModal}
          className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          title="Nova Pasta"
        >
          <FolderPlus className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300 select-none z-20">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onGoToDashboard}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition group cursor-pointer text-left"
          title="Ir para a Tela Inicial (Dashboard)"
        >
          <div className={`p-1.5 rounded-lg text-white ${accent.primaryBg} shadow-xs group-hover:scale-105 transition-transform`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              Skills & Prompts
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Diretório Local • Dashboard
            </p>
          </div>
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          title="Recolher Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar títulos, tags, conteúdo..."
            className={`w-full text-xs pl-8 pr-7 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 ${accent.ring} focus:outline-hidden transition shadow-2xs`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: New Skill & New Folder */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenNewSkillModal}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-white shadow-xs ${accent.primaryBg} transition transform active:scale-98`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            Nova Skill
          </button>
          <button
            onClick={onOpenNewFolderModal}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            Nova Pasta
          </button>
        </div>
      </div>

      {/* Filter by Tags */}
      {allTags.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3" /> Tags em uso
            </span>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1 scrollbar-thin">
            {allTags.map((tag) => {
              const isTagActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isTagActive ? null : tag)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition ${
                    isTagActive
                      ? `${accent.primaryBg} text-white shadow-2xs`
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Folder Tree Scrollable Section */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <FolderTree
          tree={tree}
          selectedSkillId={selectedSkillId}
          selectedFolderPath={selectedFolderPath}
          accentColor={accentColor}
          onSelectSkill={onSelectSkill}
          onSelectFolder={onSelectFolder}
          onCreateSkillInFolder={onCreateSkillInFolder}
          onCreateSubfolder={onCreateSubfolder}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          searchQuery={searchQuery}
          selectedTag={selectedTag}
        />
      </div>

      {/* Footer Settings & Status Badges */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Settings</span>
        </button>

        {gitConfig?.autoSync ? (
          <div
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-1 rounded-md text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold shrink-0"
            title={`Sincronização Git agendada ativa (A cada ${
              (gitConfig.autoSyncIntervalMinutes || 60) >= 60
                ? `${(gitConfig.autoSyncIntervalMinutes || 60) / 60}h`
                : `${gitConfig.autoSyncIntervalMinutes || 60}m`
            })`}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>
              AUTO-SYNC (
              {(gitConfig.autoSyncIntervalMinutes || 60) >= 60
                ? `${(gitConfig.autoSyncIntervalMinutes || 60) / 60}h`
                : `${gitConfig.autoSyncIntervalMinutes || 60}m`}
              )
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 px-2 py-1 rounded-md text-green-700 dark:text-green-300 text-[10px] font-mono font-bold shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>GIT SYNCED</span>
          </div>
        )}
      </div>
    </aside>
  );
};

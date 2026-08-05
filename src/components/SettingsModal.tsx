import React, { useState } from "react";
import {
  Settings,
  X,
  Palette,
  GitBranch,
  Folder,
  Download,
  Upload,
  Check,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Clock,
  CheckCircle2,
  Zap
} from "lucide-react";
import { AccentColor, GitConfig, ThemeConfig, ThemeMode } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";

interface SettingsModalProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (config: Partial<ThemeConfig>) => void;
  gitConfig: GitConfig | null;
  onUpdateGitConfig: (config: Partial<GitConfig>) => void;
  onSyncGitNow: () => void;
  isSyncingGit: boolean;
  onClose: () => void;
  onExportAllJson: () => void;
  onImportJsonFile: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  themeConfig,
  onUpdateTheme,
  gitConfig,
  onUpdateGitConfig,
  onSyncGitNow,
  isSyncingGit,
  onClose,
  onExportAllJson,
  onImportJsonFile,
}) => {
  const accent = ACCENT_COLORS[themeConfig.accent] || ACCENT_COLORS.indigo;
  const [activeTab, setActiveTab] = useState<"appearance" | "git" | "backup">("appearance");

  // Local Git form states
  const [repoUrl, setRepoUrl] = useState(gitConfig?.repoUrl || "");
  const [branch, setBranch] = useState(gitConfig?.branch || "main");
  const [authorName, setAuthorName] = useState(gitConfig?.authorName || "");
  const [autoSync, setAutoSync] = useState(gitConfig?.autoSync ?? true);
  const [autoSyncIntervalMinutes, setAutoSyncIntervalMinutes] = useState(
    gitConfig?.autoSyncIntervalMinutes || 60
  );

  const handleSaveGit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGitConfig({
      repoUrl,
      branch,
      authorName,
      autoSync,
      autoSyncIntervalMinutes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white ${accent.primaryBg}`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Configurações do Sistema
              </h3>
              <p className="text-[11px] text-slate-500">
                Aparência, Sincronização Git e Gerenciamento de Dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 px-6 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "appearance"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold`
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            Aparência & Tema
          </button>

          <button
            onClick={() => setActiveTab("git")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "git"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold`
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Sincronização GitHub
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "backup"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold`
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar & Importar
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          {activeTab === "appearance" && (
            <div className="space-y-6">
              {/* Theme Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Modo de Exibição
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "light", label: "Claro", icon: Sun },
                    { id: "dark", label: "Escuro", icon: Moon },
                    { id: "system", label: "Sistema", icon: Laptop },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = themeConfig.mode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => onUpdateTheme({ mode: mode.id as ThemeMode })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? `${accent.badgeBg} ${accent.primaryText} border-current/30 shadow-xs font-bold`
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Cor de Destaque (Accent Color)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((key) => {
                    const color = ACCENT_COLORS[key];
                    const isSelected = themeConfig.accent === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onUpdateTheme({ accent: key })}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-2xs flex items-center justify-center text-white"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Storage Path Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  Caminho do Diretório Único de Skills
                </div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
                  {themeConfig.storagePath || "./storage/skills"}
                </div>
              </div>
            </div>
          )}

          {activeTab === "git" && (
            <form onSubmit={handleSaveGit} className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    URL ou Caminho do Repositório Git
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/usuario/ai-skills-repo.git"
                    className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Branch Principal
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nome do Autor do Commit
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Dev IA"
                      className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
                    />
                  </div>
                </div>
              </div>

              {/* Scheduled Auto-Sync Configuration Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Agendamento de Sincronização Automática
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Persiste periodicamente as alterações locais no repositório remoto sem intervenção manual
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {autoSync && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Frequência de Sincronização:
                      </label>
                      <select
                        value={autoSyncIntervalMinutes}
                        onChange={(e) => setAutoSyncIntervalMinutes(Number(e.target.value))}
                        className={`w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 ${accent.ring} focus:outline-hidden`}
                      >
                        <option value={15}>A cada 15 minutos</option>
                        <option value={30}>A cada 30 minutos</option>
                        <option value={60}>A cada 1 hora (Recomendado)</option>
                        <option value={120}>A cada 2 horas</option>
                        <option value={240}>A cada 4 horas</option>
                      </select>
                    </div>

                    <div className="bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-lg p-2.5 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs">
                      <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-[11px]">Sincronizador Ativo</div>
                        <div className="text-[10px] text-indigo-700 dark:text-indigo-300">
                          {autoSyncIntervalMinutes >= 60
                            ? `Executando periodicamente a cada ${autoSyncIntervalMinutes / 60} hora(s)`
                            : `Executando periodicamente a cada ${autoSyncIntervalMinutes} minutos`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white transition"
                >
                  Salvar Configurações Git
                </button>

                <button
                  type="button"
                  onClick={onSyncGitNow}
                  disabled={isSyncingGit}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition flex items-center gap-2`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGit ? "animate-spin" : ""}`} />
                  Sincronizar Agora (Pull & Push)
                </button>
              </div>

              {/* Git Commits Log */}
              {gitConfig?.commits && gitConfig.commits.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Histórico de Commits e Sincronizações:
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-xs">
                    {gitConfig.commits.map((c) => (
                      <div
                        key={c.hash}
                        className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            [{c.hash}] {c.message}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {c.author} • {new Date(c.date).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                          Sincronizado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Exportar Backup Completo (JSON)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Faça o download de todas as skills e histórico de versões em um único pacote JSON estruturado para importação ou migração externa.
                </p>
                <button
                  onClick={onExportAllJson}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition flex items-center gap-2`}
                >
                  <Download className="w-4 h-4" />
                  Baixar Todas as Skills (.json)
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Importar Arquivo de Skill (.json)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Selecione um arquivo `.json` individual ou lote de backup para adicionar à sua árvore de skills.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onImportJsonFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition`}
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

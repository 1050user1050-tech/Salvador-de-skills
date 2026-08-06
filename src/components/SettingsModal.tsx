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
  Clock,
  Zap,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Eye,
  FileText
} from "lucide-react";
import { GitConfig, ThemeConfig } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";
import {
  DualTonePalette,
  DUAL_TONE_PRESETS,
  DEFAULT_PALETTE,
  isValidHex,
  getLuminance
} from "../utils/themeService";

interface SettingsModalProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (config: Partial<ThemeConfig>) => void;
  palette: DualTonePalette;
  onUpdatePalette: (palette: DualTonePalette) => void;
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
  palette,
  onUpdatePalette,
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

  // Local Dual-Tone color inputs
  const [bgInput, setBgInput] = useState(palette.bg);
  const [accentInput, setAccentInput] = useState(palette.accent);

  // Local Git form states
  const [repoUrl, setRepoUrl] = useState(gitConfig?.repoUrl || "");
  const [branch, setBranch] = useState(gitConfig?.branch || "main");
  const [authorName, setAuthorName] = useState(gitConfig?.authorName || "");
  const [autoSync, setAutoSync] = useState(gitConfig?.autoSync ?? true);
  const [autoSyncIntervalMinutes, setAutoSyncIntervalMinutes] = useState(
    gitConfig?.autoSyncIntervalMinutes || 60
  );

  const handleBgChange = (newBg: string) => {
    setBgInput(newBg);
    if (isValidHex(newBg)) {
      onUpdatePalette({ ...palette, bg: newBg });
    }
  };

  const handleAccentChange = (newAccent: string) => {
    setAccentInput(newAccent);
    if (isValidHex(newAccent)) {
      onUpdatePalette({ ...palette, accent: newAccent });
    }
  };

  const handleApplyPreset = (preset: DualTonePalette) => {
    setBgInput(preset.bg);
    setAccentInput(preset.accent);
    onUpdatePalette(preset);
  };

  const handleResetDefault = () => {
    setBgInput(DEFAULT_PALETTE.bg);
    setAccentInput(DEFAULT_PALETTE.accent);
    onUpdatePalette(DEFAULT_PALETTE);
  };

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

  const bgLuminance = getLuminance(bgInput);
  const isDarkBg = bgLuminance <= 0.5;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${accent.primaryBg} shadow-xs`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Configurações & Personalização
              </h3>
              <p className="text-[11px] text-slate-500">
                Paleta de Cores Dual-Tone, Sincronização Git e Backups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 px-6 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "appearance"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold`
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            Aparência & Cores (Dual-Tone)
          </button>

          <button
            onClick={() => setActiveTab("git")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "git"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold`
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Sincronização GitHub
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "backup"
                ? `border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold`
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
              {/* Header explanation */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Seletor de Paleta Dual-Tone Customizável</span>
                </div>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                  Defina a **Cor de Fundo (Base)** e a **Cor de Destaque (Primary)**. O aplicativo calcula dinamicamente as variações de contraste, cards, bordas e textos via variáveis CSS globais.
                </p>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Paletas Pré-definidas (1-Clique)</span>
                  </label>

                  <button
                    onClick={handleResetDefault}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar Padrão
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {DUAL_TONE_PRESETS.map((p) => {
                    const isSelected =
                      palette.bg.toLowerCase() === p.bg.toLowerCase() &&
                      palette.accent.toLowerCase() === p.accent.toLowerCase();

                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* Dual Color Swatch */}
                          <div
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                            style={{ backgroundColor: p.bg }}
                            title={`Base: ${p.bg}`}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                            style={{ backgroundColor: p.accent }}
                            title={`Destaque: ${p.accent}`}
                          />
                        </div>

                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-indigo-500 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 1. Background Color Picker */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        1. Cor de Fundo (Base / App)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Define o tom do canvas principal
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isDarkBg
                          ? "bg-slate-800 text-slate-200 border border-slate-700"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {isDarkBg ? "Tom Escuro" : "Tom Claro"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Native HTML Color Picker */}
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={isValidHex(bgInput) ? bgInput : "#0f172a"}
                        onChange={(e) => handleBgChange(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-0.5"
                      />
                    </div>

                    {/* HEX Text Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={bgInput}
                        onChange={(e) => handleBgChange(e.target.value)}
                        placeholder="#0f172a"
                        className="w-full px-3 py-2 text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* Quick Base Swatches */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Tons Rápidos:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "Slate", hex: "#0f172a" },
                        { label: "Cyber", hex: "#090d16" },
                        { label: "Zinc", hex: "#18181b" },
                        { label: "Neve", hex: "#f8fafc" },
                        { label: "Creme", hex: "#faf8f5" },
                      ].map((item) => (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => handleBgChange(item.hex)}
                          className="px-2 py-1 rounded-md text-[10px] font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Accent Color Picker */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        2. Cor de Destaque (Primary)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Botões, destaques, bordas e tags
                      </p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                      style={{ backgroundColor: isValidHex(accentInput) ? accentInput : "#6366f1" }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Native HTML Color Picker */}
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={isValidHex(accentInput) ? accentInput : "#6366f1"}
                        onChange={(e) => handleAccentChange(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-0.5"
                      />
                    </div>

                    {/* HEX Text Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={accentInput}
                        onChange={(e) => handleAccentChange(e.target.value)}
                        placeholder="#6366f1"
                        className="w-full px-3 py-2 text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* Quick Accent Swatches */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Destaques Rápidos:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "Índigo", hex: "#6366f1" },
                        { label: "Ciano", hex: "#06b6d4" },
                        { label: "Menta", hex: "#10b981" },
                        { label: "Âmbar", hex: "#f59e0b" },
                        { label: "Rosa", hex: "#f43f5e" },
                        { label: "Violeta", hex: "#8b5cf6" },
                      ].map((item) => (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => handleAccentChange(item.hex)}
                          className="px-2 py-1 rounded-md text-[10px] font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Pré-visualização em Tempo Real</span>
                </label>

                <div className="p-5 rounded-2xl custom-app-bg border custom-app-border space-y-3 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full custom-app-accent-bg" />
                      <span className="text-xs font-bold">
                        Interface do Usuário
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full custom-app-accent-badge">
                      #TagAtiva
                    </span>
                  </div>

                  <div className="p-3 rounded-xl custom-app-surface border custom-app-border space-y-1.5">
                    <p className="text-xs font-bold">
                      Card de Demonstração de Skill
                    </p>
                    <p className="text-[11px] opacity-70">
                      As cores escolhidas são calculadas automaticamente para manter contraste legível em botões, bordas e textos.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold custom-app-accent-bg shadow-2xs transition cursor-pointer"
                    >
                      Botão de Ação Primário
                    </button>
                  </div>
                </div>
              </div>

              {/* Storage Path Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  Caminho do Diretório Local de Skills
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
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
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
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
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
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
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
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value={15}>A cada 15 minutos</option>
                        <option value={30}>A cada 30 minutos</option>
                        <option value={60}>A cada 1 hora (Recomendado)</option>
                        <option value={120}>A cada 2 horas</option>
                        <option value={240}>A cada 4 horas</option>
                      </select>
                    </div>

                    <div className="bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-xl p-2.5 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white transition cursor-pointer"
                >
                  Salvar Configurações Git
                </button>

                <button
                  type="button"
                  onClick={onSyncGitNow}
                  disabled={isSyncingGit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs custom-app-accent-bg transition flex items-center gap-2 cursor-pointer"
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
                        className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
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
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs custom-app-accent-bg transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar Todas as Skills (.json)
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Importar Arquivo de Skill (.json)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Selecione um arquivo `.json` individual ou lote de backup para adicionar à sua árvore de skills.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
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
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs custom-app-accent-bg transition cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

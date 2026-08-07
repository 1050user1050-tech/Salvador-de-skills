import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  PlusCircle,
  Copy,
  Clock,
  RotateCcw,
  Check,
  Braces,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText
} from "lucide-react";
import { ACCENT_COLORS } from "../utils/accentColors";

interface PromptEditorProps {
  initialPrompt: string;
  versionName: string;
  accentColor: keyof typeof ACCENT_COLORS;
  skillKey?: string;
  onSaveCurrentVersion: (prompt: string) => void;
  onSaveNewVersion: (prompt: string, versionName: string) => void;
  onCopyPrompt: (promptText: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  initialPrompt,
  versionName,
  accentColor,
  skillKey,
  onSaveCurrentVersion,
  onSaveNewVersion,
  onCopyPrompt,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;
  const [promptText, setPromptText] = useState(initialPrompt);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [nextVersionName, setNextVersionName] = useState("");

  // Storage key for temporary local buffer
  const storageKey = `skill_draft_${skillKey || "default"}_${versionName}`;

  // Auto-save & Auto-versioning state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveDebounceSeconds, setAutoSaveDebounceSeconds] = useState(1.5); // Default 1.5s debounce
  const [autoSaveIntervalMinutes, setAutoSaveIntervalMinutes] = useState(2); // Default 2 minutes fallback
  const [autoVersionEditsLimit, setAutoVersionEditsLimit] = useState(5); // Default 5 edits
  const [autoVersionTimeLimitMinutes, setAutoVersionTimeLimitMinutes] = useState(30); // Default 30 minutes

  const [editBatchCount, setEditBatchCount] = useState(0);
  const [lastVersionCreatedTime, setLastVersionCreatedTime] = useState<number>(Date.now());
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved" | "buffered">("saved");
  const [hasBufferedDraft, setHasBufferedDraft] = useState(false);
  const [showAutoSaveSettings, setShowAutoSaveSettings] = useState(false);
  const [copiedPromptText, setCopiedPromptText] = useState(false);

  // Refs for tracking timestamps, debounces & latest values across unmounts/renders
  const lastSaveTimeRef = useRef<number>(Date.now());
  const editBatchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceBufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  const promptTextRef = useRef(promptText);
  const initialPromptRef = useRef(initialPrompt);
  const storageKeyRef = useRef(storageKey);

  // Synchronize refs
  useEffect(() => {
    promptTextRef.current = promptText;
  }, [promptText]);

  useEffect(() => {
    initialPromptRef.current = initialPrompt;
    storageKeyRef.current = storageKey;
  }, [initialPrompt, storageKey]);

  // Sync initialPrompt and check local storage draft when switching skills or versions
  useEffect(() => {
    const cachedDraft = localStorage.getItem(storageKey);
    if (cachedDraft && cachedDraft !== initialPrompt) {
      setPromptText(cachedDraft);
      setHasBufferedDraft(true);
      setAutoSaveStatus("buffered");
    } else {
      setPromptText(initialPrompt);
      setHasBufferedDraft(false);
      setAutoSaveStatus("saved");
    }
    setEditBatchCount(0);
    lastSaveTimeRef.current = Date.now();
  }, [initialPrompt, versionName, storageKey]);

  // Before unload / unmount safety: save buffer if there are pending unsaved changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (promptTextRef.current !== initialPromptRef.current) {
        localStorage.setItem(storageKeyRef.current, promptTextRef.current);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (promptTextRef.current !== initialPromptRef.current) {
        localStorage.setItem(storageKeyRef.current, promptTextRef.current);
      }
    };
  }, []);

  // Handle Ctrl+S or Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (promptText !== initialPrompt) {
          triggerSaveCurrent();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [promptText, initialPrompt]);

  // Extract variables in {{var_name}} format
  const detectedVariables = Array.from(
    new Set(Array.from(promptText.matchAll(/\{\{([^}]+)\}\}/g)).map((match) => match[1].trim()))
  );

  const charCount = promptText.length;
  const wordCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.ceil(charCount / 4);

  const hasChanges = promptText !== initialPrompt;

  // Auto increment version recommendation helper
  const suggestNextVersion = () => {
    if (versionName.startsWith("v")) {
      const parts = versionName.replace("v", "").split(".");
      if (parts.length === 2) {
        const major = parseInt(parts[0], 10);
        const minor = parseInt(parts[1], 10);
        return `v${major}.${minor + 1}`;
      }
    }
    return `${versionName}_v2`;
  };

  // Helper to format timestamp
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Helper: Save Current Version & Clear Local Buffer
  const triggerSaveCurrent = (textToSave?: string) => {
    const content = textToSave !== undefined ? textToSave : promptText;
    setAutoSaveStatus("saving");
    onSaveCurrentVersion(content);
    localStorage.removeItem(storageKey);
    setHasBufferedDraft(false);
    const timeStr = getFormattedTime();
    setLastAutoSaveTime(timeStr);
    lastSaveTimeRef.current = Date.now();
    setTimeout(() => setAutoSaveStatus("saved"), 600);
  };

  // Helper: Create Auto Version
  const triggerAutoVersion = (reason: string) => {
    setAutoSaveStatus("saving");
    const nextVer = suggestNextVersion();
    onSaveNewVersion(promptText, nextVer);
    localStorage.removeItem(storageKey);
    setHasBufferedDraft(false);
    const timeStr = getFormattedTime();
    setLastAutoSaveTime(timeStr);
    setEditBatchCount(0);
    setLastVersionCreatedTime(Date.now());
    lastSaveTimeRef.current = Date.now();
    setTimeout(() => setAutoSaveStatus("saved"), 600);
  };

  // Helper: Discard Changes and Clear Buffer
  const handleDiscardChanges = () => {
    setPromptText(initialPrompt);
    localStorage.removeItem(storageKey);
    setHasBufferedDraft(false);
    setAutoSaveStatus("saved");
  };

  // Debounced input handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPromptText(newText);
    setAutoSaveStatus("unsaved");

    // 1. Immediately save to local buffer (localStorage) after 250ms delay
    if (debounceBufferTimerRef.current) clearTimeout(debounceBufferTimerRef.current);
    debounceBufferTimerRef.current = setTimeout(() => {
      if (newText !== initialPrompt) {
        localStorage.setItem(storageKey, newText);
        setHasBufferedDraft(true);
        if (autoSaveStatus !== "saving") setAutoSaveStatus("buffered");
      } else {
        localStorage.removeItem(storageKey);
        setHasBufferedDraft(false);
        setAutoSaveStatus("saved");
      }
    }, 250);

    // 2. Debounce batch edit counting
    if (editBatchTimerRef.current) clearTimeout(editBatchTimerRef.current);
    editBatchTimerRef.current = setTimeout(() => {
      setEditBatchCount((prev) => prev + 1);
    }, 1200);

    // 3. Debounced Auto-Save to current version
    if (debounceAutoSaveTimerRef.current) clearTimeout(debounceAutoSaveTimerRef.current);

    if (autoSaveEnabled) {
      debounceAutoSaveTimerRef.current = setTimeout(() => {
        if (newText !== initialPrompt) {
          triggerSaveCurrent(newText);
        }
      }, autoSaveDebounceSeconds * 1000);
    }
  };

  // Auto-Save Interval Engine (Fallback for periodic check / auto-versioning)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const intervalMs = autoSaveIntervalMinutes * 60 * 1000;
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      if (promptText !== initialPrompt && timeSinceLastSave >= intervalMs) {
        const timeSinceLastVersionMs = now - lastVersionCreatedTime;
        const timeLimitMs = autoVersionTimeLimitMinutes * 60 * 1000;

        if (editBatchCount >= autoVersionEditsLimit) {
          triggerAutoVersion(`Atingido limite de ${autoVersionEditsLimit} edições`);
        } else if (timeSinceLastVersionMs >= timeLimitMs) {
          triggerAutoVersion(`Atingido limite de ${autoVersionTimeLimitMinutes} min de alterações`);
        } else {
          triggerSaveCurrent();
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [
    autoSaveEnabled,
    promptText,
    initialPrompt,
    autoSaveIntervalMinutes,
    autoVersionEditsLimit,
    autoVersionTimeLimitMinutes,
    editBatchCount,
    lastVersionCreatedTime,
  ]);

  const handleOpenNewVersionModal = () => {
    setNextVersionName(suggestNextVersion());
    setIsNewVersionModalOpen(true);
  };

  const handleCopyCode = () => {
    onCopyPrompt(promptText);
    setCopiedPromptText(true);
    setTimeout(() => setCopiedPromptText(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Professional Polish Header Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* File Tab Indicator */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-xs font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{versionName}</span>
          </div>

          {/* Auto-Save Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowAutoSaveSettings(!showAutoSaveSettings)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition border ${
                autoSaveEnabled
                  ? autoSaveStatus === "saving"
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                    : autoSaveStatus === "buffered"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    : "bg-green-50/80 dark:bg-green-950/60 border-green-200 dark:border-green-800/80 text-green-700 dark:text-green-300 hover:bg-green-100"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
              title="Clique para configurar parâmetros do auto-save e auto-versionamento"
            >
              {autoSaveEnabled ? (
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    autoSaveStatus === "saving"
                      ? "bg-amber-500 animate-spin"
                      : autoSaveStatus === "buffered"
                      ? "bg-indigo-500"
                      : "bg-green-500 animate-pulse"
                  }`}
                />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              )}
              <span>
                {autoSaveStatus === "saving"
                  ? "SALVANDO..."
                  : autoSaveStatus === "buffered"
                  ? "RASCUNHO EM BUFFER"
                  : autoSaveEnabled
                  ? lastAutoSaveTime
                    ? `AUTO-SALVO (${lastAutoSaveTime})`
                    : `AUTO-SAVE (${autoSaveDebounceSeconds}s)`
                  : "AUTO-SAVE PAUSADO"}
              </span>
              <Sliders className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Auto-Save & Auto-Version Settings Popover */}
            {showAutoSaveSettings && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xl z-30 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Configurar Auto-Save & Versões
                  </span>
                  <button
                    onClick={() => setShowAutoSaveSettings(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Enable Switch */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Ativar Salvamento Automático</span>
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Debounce Delay Seconds */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pausa ao Digitar (Debounce Delay):
                  </label>
                  <select
                    value={autoSaveDebounceSeconds}
                    onChange={(e) => setAutoSaveDebounceSeconds(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value={1}>1.0 segundo (Rápido)</option>
                    <option value={1.5}>1.5 segundos (Padrão)</option>
                    <option value={3}>3.0 segundos</option>
                    <option value={5}>5.0 segundos</option>
                  </select>
                </div>

                {/* Fallback Interval Minutes */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verificação Periódica de Mudanças:
                  </label>
                  <select
                    value={autoSaveIntervalMinutes}
                    onChange={(e) => setAutoSaveIntervalMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value={1}>A cada 1 minuto</option>
                    <option value={2}>A cada 2 minutos (Padrão)</option>
                    <option value={5}>A cada 5 minutos</option>
                  </select>
                </div>

                {/* Auto Version Edits Limit */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-Criar Versão por N° de Edições:
                  </label>
                  <select
                    value={autoVersionEditsLimit}
                    onChange={(e) => setAutoVersionEditsLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value={3}>Após 3 edições</option>
                    <option value={5}>Após 5 edições (Padrão)</option>
                    <option value={10}>Após 10 edições</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Edits Counter toward Next Auto-Version */}
          {hasChanges && (
            <div
              className="hidden md:flex items-center gap-1 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md"
              title={`Criará uma nova versão no histórico automaticamente ao atingir ${autoVersionEditsLimit} edições`}
            >
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>
                Auto-versão: {editBatchCount}/{autoVersionEditsLimit} edições
              </span>
            </div>
          )}

          {/* Variables Pills */}
          {detectedVariables.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 text-[11px]">
              <Braces className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {detectedVariables.slice(0, 3).map((v) => (
                  <span
                    key={v}
                    className="px-1.5 py-0.2 font-mono text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
                {detectedVariables.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{detectedVariables.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={() => {
                setPromptText(initialPrompt);
                setAutoSaveStatus("saved");
              }}
              className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1"
              title="Descartar alterações não salvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Descartar</span>
            </button>
          )}

          <button
            onClick={triggerSaveCurrent}
            disabled={!hasChanges}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              hasChanges
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-xs cursor-pointer"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }`}
            title="Salvar alterações na versão atual (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar {versionName}</span>
          </button>

          <button
            onClick={handleOpenNewVersionModal}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} flex items-center gap-1.5 transition cursor-pointer`}
            title="Criar manualmente uma nova entrada de versão"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Criar Versão</span>
          </button>
        </div>
      </div>

      {/* Restored Local Draft Banner */}
      {hasBufferedDraft && promptText !== initialPrompt && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs text-amber-900 dark:text-amber-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Rascunho recuperado:</strong> Edições não salvas do buffer local foram restauradas.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSaveCurrent()}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer"
            >
              Salvar na Versão
            </button>
            <button
              onClick={handleDiscardChanges}
              className="px-2.5 py-1 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg font-semibold text-[11px] transition cursor-pointer"
            >
              Descartar Rascunho
            </button>
          </div>
        </div>
      )}

      {/* Code Editor Body Simulator */}
      <div className="flex-1 relative min-h-[340px] bg-white dark:bg-slate-900 flex flex-col">
        <textarea
          value={promptText}
          onChange={handleTextChange}
          placeholder="Digite ou cole aqui o conteúdo do seu prompt..."
          className="w-full flex-1 p-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-hidden selection:bg-indigo-500/20 border-none"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer / Stats & Auto-save Status Bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span>PALAVRAS: {wordCount}</span>
          <span>TOKENS: ~{estimatedTokens}</span>
          <span>CARACTERES: {charCount}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {copiedPromptText ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-600">COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>COPIAR PROMPT</span>
              </>
            )}
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-400 hidden sm:inline">Ctrl + S</span>
        </div>
      </div>

      {/* Modal: Save as New Version */}
      {isNewVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PlusCircle className={`w-5 h-5 ${accent.primaryText}`} />
                Criar Nova Versão de Prompt
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cria uma nova versão numerada no array `versoes` do arquivo JSON da skill.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome/Identificador da Versão (ex: v1.2, v2.0):
              </label>
              <input
                type="text"
                value={nextVersionName}
                onChange={(e) => setNextVersionName(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewVersionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (nextVersionName.trim()) {
                    onSaveNewVersion(promptText, nextVersionName.trim());
                    setIsNewVersionModalOpen(false);
                    setEditBatchCount(0);
                    setLastVersionCreatedTime(Date.now());
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition`}
              >
                Confirmar Versão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


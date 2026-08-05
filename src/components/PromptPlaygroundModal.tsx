import React, { useState } from "react";
import { Play, Sparkles, X, Copy, Check, RefreshCw, Terminal, Braces } from "lucide-react";
import { GeminiService } from "../services/geminiService";
import { ACCENT_COLORS } from "../utils/accentColors";

interface PromptPlaygroundModalProps {
  promptText: string;
  skillTitle: string;
  accentColor: keyof typeof ACCENT_COLORS;
  onClose: () => void;
  onCopyText: (text: string) => void;
}

export const PromptPlaygroundModal: React.FC<PromptPlaygroundModalProps> = ({
  promptText,
  skillTitle,
  accentColor,
  onClose,
  onCopyText,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  // Extract variables
  const variables = Array.from(
    new Set(Array.from(promptText.matchAll(/\{\{([^}]+)\}\}/g)).map((match) => match[1].trim()))
  );

  const [varValues, setVarValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v] = "";
    });
    return initial;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);

  const handleRunTest = async () => {
    setIsLoading(true);
    setOutput(null);

    const res = await GeminiService.testPrompt(promptText, varValues);
    setOutput(res.result);
    setIsSimulation(res.simulation);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white ${accent.primaryBg}`}>
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Playground de Teste - {skillTitle}
              </h3>
              <p className="text-[11px] text-slate-500">Testar execução do prompt com IA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Variables Inputs Section */}
          {variables.length > 0 ? (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Braces className="w-4 h-4 text-amber-500" />
                Preencha as Variáveis do Prompt:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variables.map((varName) => (
                  <div key={varName} className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {`{{${varName}}}`}
                    </label>
                    <input
                      type="text"
                      value={varValues[varName] || ""}
                      onChange={(e) =>
                        setVarValues((prev) => ({ ...prev, [varName]: e.target.value }))
                      }
                      placeholder={`Valor para ${varName}...`}
                      className={`w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              Este prompt não possui variáveis dinâmicas no formato {"{{variável}}"}.
            </div>
          )}

          {/* Prompt Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prompt Atual:
            </label>
            <div className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-xs max-h-36 overflow-y-auto border border-slate-800">
              {promptText}
            </div>
          </div>

          {/* Test Execution Output */}
          {output && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Resposta do Modelo:
                </label>
                <button
                  onClick={() => onCopyText(output)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Resposta
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800">
                {output}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Modelo: Gemini 2.5 Flash</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Fechar
            </button>
            <button
              onClick={handleRunTest}
              disabled={isLoading}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition flex items-center gap-2 disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Executar Teste
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

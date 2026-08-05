import React, { useState } from "react";
import { ArrowLeftRight, Check, Sparkles } from "lucide-react";
import { SkillVersion } from "../types/skill";

interface VersionDiffViewerProps {
  versions: SkillVersion[];
  currentVersionIndex: number;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  versions,
  currentVersionIndex,
}) => {
  const [compareVersionIndex, setCompareVersionIndex] = useState<number>(
    currentVersionIndex > 0 ? currentVersionIndex - 1 : 0
  );

  const currentVer = versions[currentVersionIndex];
  const compareVer = versions[compareVersionIndex];

  if (!currentVer || !compareVer) return null;

  const currentLines = currentVer.conteudo_do_prompt.split("\n");
  const compareLines = compareVer.conteudo_do_prompt.split("\n");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner font-mono text-xs text-slate-200 my-4">
      {/* Header Controls */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
          <span className="font-sans font-semibold text-xs text-slate-300">
            Comparador de Versões (Diff)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-sans">Base:</span>
            <select
              value={compareVersionIndex}
              onChange={(e) => setCompareVersionIndex(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-hidden"
            >
              {versions.map((v, idx) => (
                <option key={v.versao} value={idx}>
                  {v.versao} ({new Date(v.data).toLocaleDateString("pt-BR")})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500">vs</span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-sans">Atual:</span>
            <span className="font-bold text-indigo-400">{currentVer.versao}</span>
          </div>
        </div>
      </div>

      {/* Side by Side Diff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 max-h-96 overflow-y-auto scrollbar-thin">
        {/* Compare Version Pane */}
        <div className="p-3 bg-slate-950/40">
          <div className="text-[11px] font-sans font-medium text-slate-400 mb-2 border-b border-slate-800/80 pb-1">
            Versão Anterior: <span className="text-slate-200">{compareVer.versao}</span>
          </div>
          <div className="space-y-1">
            {compareLines.map((line, idx) => {
              const isRemoved = !currentLines.includes(line);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-1.5 py-0.5 rounded ${
                    isRemoved ? "bg-rose-950/50 text-rose-300 border-l-2 border-rose-500" : "text-slate-300"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-slate-600 select-none text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Version Pane */}
        <div className="p-3 bg-slate-900/40">
          <div className="text-[11px] font-sans font-medium text-slate-400 mb-2 border-b border-slate-800/80 pb-1">
            Versão Selecionada: <span className="text-indigo-400 font-bold">{currentVer.versao}</span>
          </div>
          <div className="space-y-1">
            {currentLines.map((line, idx) => {
              const isAdded = !compareLines.includes(line);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-1.5 py-0.5 rounded ${
                    isAdded ? "bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500" : "text-slate-300"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-slate-600 select-none text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  FileCode,
  Sparkles,
  Edit,
  Trash2,
  Clock,
  Check,
  Play,
  ArrowLeftRight,
  PlusCircle,
  Tag,
  Share2,
  FileText,
  Github,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  Upload,
  Eye,
  X,
  Loader2
} from "lucide-react";
import { Skill, SkillVersion } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";
import { StorageService } from "../services/storageService";
import { PromptEditor } from "./PromptEditor";
import { VersionDiffViewer } from "./VersionDiffViewer";

interface SkillDetailProps {
  skill: Skill;
  relativePath: string;
  accentColor: keyof typeof ACCENT_COLORS;
  onCopyPromptText: (text: string) => void;
  onCopyCompleteJson: (skillData: Skill) => void;
  onSaveCurrentVersionPrompt: (promptText: string, versionName: string) => void;
  onSaveNewVersionPrompt: (promptText: string, newVersionName: string) => void;
  onDeleteSkill: (relativePath: string) => void;
  onEditSkillMetadata: (skill: Skill) => void;
  onOpenPlayground: (promptText: string, title: string) => void;
}

export const SkillDetail: React.FC<SkillDetailProps> = ({
  skill,
  relativePath,
  accentColor,
  onCopyPromptText,
  onCopyCompleteJson,
  onSaveCurrentVersionPrompt,
  onSaveNewVersionPrompt,
  onDeleteSkill,
  onEditSkillMetadata,
  onOpenPlayground,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  // Track active selected version index
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(() => {
    return skill.versoes.length > 0 ? skill.versoes.length - 1 : 0;
  });

  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [isCopiedJson, setIsCopiedJson] = useState(false);

  // Asset / Attachments state
  const [assets, setAssets] = useState<string[]>(skill.assets || []);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update assets list if skill changes
  useEffect(() => {
    setAssets(skill.assets || []);
    setSelectedVersionIndex(skill.versoes.length > 0 ? skill.versoes.length - 1 : 0);
  }, [skill.id, skill.relativePath, skill.assets]);

  const currentVersion: SkillVersion | undefined = skill.versoes[selectedVersionIndex] || skill.versoes[0];

  // Image Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const targetRelPath = skill.relativePath || relativePath;
    const res = await StorageService.uploadAsset(targetRelPath, file);
    setIsUploading(false);

    if (res.success && res.fileName) {
      if (!assets.includes(res.fileName)) {
        setAssets((prev) => [...prev, res.fileName!]);
      }
    } else {
      alert(res.error || "Erro ao anexar imagem");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Image Delete Handler
  const handleDeleteAsset = async (fileName: string) => {
    if (!confirm(`Deseja remover o anexo "${fileName}"?`)) return;

    const targetRelPath = skill.relativePath || relativePath;
    const success = await StorageService.deleteAsset(targetRelPath, fileName);
    if (success) {
      setAssets((prev) => prev.filter((a) => a !== fileName));
    }
  };

  const handleCopyPrompt = () => {
    if (currentVersion?.conteudo_do_prompt) {
      onCopyPromptText(currentVersion.conteudo_do_prompt);
      setIsCopiedPrompt(true);
      setTimeout(() => setIsCopiedPrompt(false), 2000);
    }
  };

  const handleCopyJson = () => {
    onCopyCompleteJson(skill);
    setIsCopiedJson(true);
    setTimeout(() => setIsCopiedJson(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50 dark:bg-slate-950/50 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin">
      {/* Top Header & Core Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Main Buttons Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            {/* 1. Copiar Texto (Apenas o Prompt da versão selecionada) */}
            <button
              onClick={handleCopyPrompt}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition flex items-center gap-2 transform active:scale-98`}
            >
              {isCopiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedPrompt ? "Texto Copiado!" : "Copiar Texto"}</span>
            </button>

            {/* 2. Copiar Arquivo (JSON Completo da Skill) */}
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white transition flex items-center gap-2 shadow-xs transform active:scale-98"
            >
              {isCopiedJson ? <Check className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
              <span>{isCopiedJson ? "JSON Copiado!" : "Copiar Arquivo"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Test Prompt Playground Button */}
            <button
              onClick={() =>
                currentVersion && onOpenPlayground(currentVersion.conteudo_do_prompt, skill.titulo)
              }
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Testar Prompt</span>
            </button>

            {/* Version Diff Viewer Toggle */}
            {skill.versoes.length > 1 && (
              <button
                onClick={() => setShowDiffViewer(!showDiffViewer)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                  showDiffViewer
                    ? `${accent.badgeBg} ${accent.primaryText}`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Diff ({skill.versoes.length}v)</span>
              </button>
            )}

            {/* Edit Metadata */}
            <button
              onClick={() => onEditSkillMetadata(skill)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Editar Título, Descrição e Tags"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Delete Skill */}
            <button
              onClick={() => {
                if (confirm(`Deseja realmente excluir a skill '${skill.titulo}'?`)) {
                  onDeleteSkill(relativePath);
                }
              }}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition"
              title="Excluir esta skill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Description Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {skill.titulo}
            </h1>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
              {relativePath}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {skill.descricao || "Sem descrição informada."}
          </p>

          {/* GitHub / Creator Link */}
          {skill.link_github && (
            <div className="pt-0.5">
              <a
                href={skill.link_github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition group shadow-2xs"
                title="Abrir repositório ou link do autor no GitHub"
              >
                <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-sm underline text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  {skill.link_github}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-70 group-hover:opacity-100" />
              </a>
            </div>
          )}

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Visual Version Selector (Tabs / Dropdown) */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Histórico de Versões:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none py-1">
            {skill.versoes.map((ver, idx) => {
              const isSelected = idx === selectedVersionIndex;
              return (
                <button
                  key={ver.versao + idx}
                  onClick={() => setSelectedVersionIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
                    isSelected
                      ? `${accent.primaryBg} text-white shadow-2xs font-bold`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{ver.versao}</span>
                  <span className="opacity-70 text-[10px]">
                    {new Date(ver.data).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section: Anexos e Imagens da Skill (assets/ folder) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Anexos e Imagens da Skill (`assets/`)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {assets.length} {assets.length === 1 ? "arquivo" : "arquivos"}
            </span>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white ${accent.primaryBg} hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-2xs`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Anexar Imagem</span>
                </>
              )}
            </button>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-950/50 space-y-1">
            <Paperclip className="w-5 h-5 mx-auto text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma imagem anexada a esta skill.
            </p>
            <p className="text-[11px] text-slate-400">
              Clique em <strong className="text-slate-600 dark:text-slate-300">Anexar Imagem</strong> para salvar capturas de tela, diagramas ou exemplos na pasta <code className="font-mono text-indigo-500">assets/</code> da skill.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {assets.map((fileName) => {
              const imgUrl = StorageService.getAssetUrl(skill.relativePath || relativePath, fileName);
              return (
                <div
                  key={fileName}
                  className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition hover:border-indigo-500/50"
                >
                  <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={fileName}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover Overlay Controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(imgUrl)}
                        className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg shadow-xs transition cursor-pointer"
                        title="Visualizar em tela cheia"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(fileName)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                        title="Excluir anexo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 truncate" title={fileName}>
                      {fileName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Version Diff View (if toggled) */}
      {showDiffViewer && (
        <VersionDiffViewer
          versions={skill.versoes}
          currentVersionIndex={selectedVersionIndex}
        />
      )}

      {/* Prompt Editor for Selected Version */}
      {currentVersion && (
        <div className="flex-1 min-h-[400px]">
          <PromptEditor
            initialPrompt={currentVersion.conteudo_do_prompt}
            versionName={currentVersion.versao}
            accentColor={accentColor}
            onSaveCurrentVersion={(updatedPrompt) =>
              onSaveCurrentVersionPrompt(updatedPrompt, currentVersion.versao)
            }
            onSaveNewVersion={(updatedPrompt, newVerName) =>
              onSaveNewVersionPrompt(updatedPrompt, newVerName)
            }
            onCopyPrompt={onCopyPromptText}
          />
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-2 overflow-hidden shadow-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Visualização do anexo"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

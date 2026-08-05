import React, { useState } from "react";
import { FilePlus, X, Tag, Folder, Plus, Github, Link } from "lucide-react";
import { Skill } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";

interface SkillFormModalProps {
  initialSkill?: Skill;
  defaultFolder?: string;
  existingFolders: string[];
  accentColor: keyof typeof ACCENT_COLORS;
  onClose: () => void;
  onSave: (skillData: Partial<Skill>, folderRelativePath: string, filename: string) => void;
}

export const SkillFormModal: React.FC<SkillFormModalProps> = ({
  initialSkill,
  defaultFolder = "",
  existingFolders,
  accentColor,
  onClose,
  onSave,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  const [titulo, setTitulo] = useState(initialSkill?.titulo || "");
  const [descricao, setDescricao] = useState(initialSkill?.descricao || "");
  const [linkGithub, setLinkGithub] = useState(initialSkill?.link_github || "");
  const [folder, setFolder] = useState(defaultFolder);
  const [filename, setFilename] = useState(initialSkill?.filename || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialSkill?.tags || ["frontend", "prompt"]);
  const [initialPrompt, setInitialPrompt] = useState(
    initialSkill?.versoes?.[0]?.conteudo_do_prompt || "Você é um especialista em..."
  );

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const cleanFilename = filename.trim()
      ? filename.trim().endsWith(".json")
        ? filename.trim()
        : `${filename.trim()}.json`
      : `${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;

    const skillData: Partial<Skill> = {
      id: initialSkill?.id || `skill_${Date.now()}`,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      link_github: linkGithub.trim() || undefined,
      tags,
      versoes: initialSkill?.versoes || [
        {
          versao: "v1.0",
          data: new Date().toISOString(),
          conteudo_do_prompt: initialPrompt
        }
      ]
    };

    onSave(skillData, folder, cleanFilename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FilePlus className={`w-5 h-5 ${accent.primaryText}`} />
            {initialSkill ? "Editar Skill" : "Criar Nova Skill"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Título da Skill *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Refatorador Clean Code React"
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descrição Curta
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve explicação humanamente legível sobre a utilidade desta skill..."
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden resize-none`}
            />
          </div>

          {/* GitHub / Repository Link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Link do GitHub / Repositório (Opcional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={linkGithub}
                onChange={(e) => setLinkGithub(e.target.value)}
                placeholder="https://github.com/usuario/repositorio"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden font-mono`}
              />
            </div>
          </div>

          {/* Target Folder Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-amber-500" /> Pasta Destino
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
            >
              <option value="">/ (Raiz do projeto)</option>
              {existingFolders.map((f) => (
                <option key={f} value={f}>
                  /{f}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Manager */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" /> Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Adicionar tag (pressione Enter)..."
                className={`flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={`px-3 py-1.5 text-xs font-medium text-white ${accent.primaryBg} rounded-lg`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Initial Prompt Content (only if new skill) */}
          {!initialSkill && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Conteúdo Inicial do Prompt (v1.0)
              </label>
              <textarea
                rows={4}
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Digite as instruções do prompt..."
                className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden resize-none`}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition`}
            >
              {initialSkill ? "Salvar Skill" : "Criar Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

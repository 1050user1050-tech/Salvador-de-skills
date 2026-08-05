import React, { useState } from "react";
import { FolderPlus, X, Folder } from "lucide-react";
import { ACCENT_COLORS } from "../utils/accentColors";

interface FolderFormModalProps {
  parentFolder?: string;
  existingFolders: string[];
  accentColor: keyof typeof ACCENT_COLORS;
  onClose: () => void;
  onCreateFolder: (parentFolder: string, folderName: string) => void;
}

export const FolderFormModal: React.FC<FolderFormModalProps> = ({
  parentFolder = "",
  existingFolders,
  accentColor,
  onClose,
  onCreateFolder,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  const [targetParentFolder, setTargetParentFolder] = useState(parentFolder);
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    // Clean folder name
    const cleanName = folderName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    onCreateFolder(targetParentFolder, cleanName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-500" />
            Criar Nova Pasta
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pasta Pai
            </label>
            <select
              value={targetParentFolder}
              onChange={(e) => setTargetParentFolder(e.target.value)}
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
            >
              <option value="">/ (Raiz)</option>
              {existingFolders.map((f) => (
                <option key={f} value={f}>
                  /{f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nome da Nova Pasta *
            </label>
            <input
              type="text"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ex: frontend, token-optimization, database..."
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 ${accent.ring} focus:outline-hidden`}
            />
          </div>

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
              Criar Pasta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

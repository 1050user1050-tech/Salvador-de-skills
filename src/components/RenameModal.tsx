import React, { useState, useEffect } from "react";
import { Edit2, X, Folder, FileCode } from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  itemType: "file" | "folder";
  relativePath: string;
  onRename: (newName: string) => void;
  onClose: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  currentName,
  itemType,
  relativePath,
  onRename,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(currentName.replace(/\.json$/, ""));

  useEffect(() => {
    setNameInput(currentName.replace(/\.json$/, ""));
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const isFolder = itemType === "folder";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim() && nameInput.trim() !== currentName.replace(/\.json$/, "")) {
      onRename(nameInput.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Renomear {isFolder ? "Pasta" : "Skill"}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                {relativePath}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {isFolder ? (
                <Folder className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>Novo Nome para {isFolder ? "a Pasta" : "a Skill"}:</span>
            </label>
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Digite o novo nome..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 font-medium"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Nota:</p>
            <p>O nome será atualizado em todos os caminhos do repositório e árvore de arquivos.</p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              Salvar Nome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

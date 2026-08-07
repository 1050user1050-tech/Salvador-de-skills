import React from "react";
import { AlertTriangle, Trash2, X, Folder, FileCode } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType: "file" | "folder";
  relativePath: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  itemType,
  relativePath,
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isFolder = itemType === "folder";
  const defaultTitle = isFolder ? "Excluir Pasta" : "Excluir Skill";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title || defaultTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Esta ação é permanente e não poderá ser desfeita.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              {isFolder ? (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {itemName}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800 truncate">
              {relativePath}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isFolder ? (
              <>
                Tem certeza de que deseja excluir a pasta <strong className="text-slate-900 dark:text-slate-100">{itemName}</strong>? Todos os arquivos e subpastas contidos nela também serão removidos permanentemente.
              </>
            ) : (
              <>
                Tem certeza de que deseja excluir a skill <strong className="text-slate-900 dark:text-slate-100">{itemName}</strong>? Todas as versões de prompts, históricos e anexos associados serão apagados do repositório.
              </>
            )}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Excluindo..." : "Sim, Excluir Definitivamente"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

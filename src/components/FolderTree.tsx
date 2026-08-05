import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  Layers
} from "lucide-react";
import { FileTreeNode, Skill } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";

interface FolderTreeProps {
  tree: FileTreeNode[];
  selectedSkillId: string | null;
  selectedFolderPath: string;
  accentColor: keyof typeof ACCENT_COLORS;
  onSelectSkill: (skill: Skill, relativePath: string) => void;
  onSelectFolder: (folderPath: string) => void;
  onCreateSkillInFolder: (folderRelativePath: string) => void;
  onCreateSubfolder: (parentFolderRelativePath: string) => void;
  onRenameItem: (relativePath: string, name: string, type: "file" | "folder") => void;
  onDeleteItem: (relativePath: string, type: "file" | "folder") => void;
  searchQuery: string;
  selectedTag: string | null;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  tree,
  selectedSkillId,
  selectedFolderPath,
  accentColor,
  onSelectSkill,
  onSelectFolder,
  onCreateSkillInFolder,
  onCreateSubfolder,
  onRenameItem,
  onDeleteItem,
  searchQuery,
  selectedTag,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  // Filter tree nodes recursively based on searchQuery and selectedTag
  const filterNode = (node: FileTreeNode): FileTreeNode | null => {
    if (node.type === "file") {
      if (!node.data) return null;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        node.data.titulo.toLowerCase().includes(q) ||
        node.data.descricao.toLowerCase().includes(q) ||
        node.name.toLowerCase().includes(q) ||
        node.data.tags.some((t) => t.toLowerCase().includes(q)) ||
        node.data.versoes.some((v) => v.conteudo_do_prompt.toLowerCase().includes(q));

      const matchesTag = !selectedTag || node.data.tags.includes(selectedTag);

      return matchesSearch && matchesTag ? node : null;
    } else {
      const filteredChildren = (node.children || [])
        .map((child) => filterNode(child))
        .filter(Boolean) as FileTreeNode[];

      if (filteredChildren.length > 0 || !searchQuery) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    }
  };

  const filteredTree = tree.map((node) => filterNode(node)).filter(Boolean) as FileTreeNode[];

  return (
    <div className="space-y-1 font-sans text-xs select-none">
      {filteredTree.length === 0 ? (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          <p className="text-xs">Nenhum item encontrado</p>
          {searchQuery && (
            <p className="text-[11px] mt-1 opacity-75">Tente ajustar seus termos de pesquisa</p>
          )}
        </div>
      ) : (
        filteredTree.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            selectedSkillId={selectedSkillId}
            selectedFolderPath={selectedFolderPath}
            accent={accent}
            onSelectSkill={onSelectSkill}
            onSelectFolder={onSelectFolder}
            onCreateSkillInFolder={onCreateSkillInFolder}
            onCreateSubfolder={onCreateSubfolder}
            onRenameItem={onRenameItem}
            onDeleteItem={onDeleteItem}
          />
        ))
      )}
    </div>
  );
};

interface TreeNodeItemProps {
  node: FileTreeNode;
  level: number;
  selectedSkillId: string | null;
  selectedFolderPath: string;
  accent: any;
  onSelectSkill: (skill: Skill, relativePath: string) => void;
  onSelectFolder: (folderPath: string) => void;
  onCreateSkillInFolder: (folderRelativePath: string) => void;
  onCreateSubfolder: (parentFolderRelativePath: string) => void;
  onRenameItem: (relativePath: string, name: string, type: "file" | "folder") => void;
  onDeleteItem: (relativePath: string, type: "file" | "folder") => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  selectedSkillId,
  selectedFolderPath,
  accent,
  onSelectSkill,
  onSelectFolder,
  onCreateSkillInFolder,
  onCreateSubfolder,
  onRenameItem,
  onDeleteItem,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isFolder = node.type === "folder";
  const isSelectedFile = !isFolder && node.data?.id === selectedSkillId;
  const isSelectedFolder = isFolder && selectedFolderPath === node.relativePath;

  const versionCount = node.data?.versoes?.length || 0;
  const latestVersion = versionCount > 0 ? node.data?.versoes[versionCount - 1].versao : null;

  return (
    <div>
      <div
        className={`group relative flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
          isSelectedFile
            ? `${accent.badgeBg} ${accent.primaryText} font-medium border border-current/20 shadow-xs`
            : isSelectedFolder
            ? "bg-slate-200/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMenu(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) {
            setIsOpen(!isOpen);
            onSelectFolder(node.relativePath);
          } else if (node.data) {
            onSelectSkill(node.data, node.relativePath);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isFolder ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {isFolder ? (
            isOpen ? (
              <FolderOpen className={`w-4 h-4 text-amber-500 shrink-0`} />
            ) : (
              <Folder className={`w-4 h-4 text-amber-500 shrink-0`} />
            )
          ) : (
            <FileCode className={`w-4 h-4 shrink-0 ${isSelectedFile ? accent.primaryText : "text-slate-400"}`} />
          )}

          <span className="truncate text-xs tracking-tight">
            {isFolder ? node.name : node.data?.titulo || node.name.replace(".json", "")}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isFolder && latestVersion && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {latestVersion}
            </span>
          )}

          {isHovered && (
            <div className="flex items-center gap-0.5 bg-slate-200/90 dark:bg-slate-800/90 rounded-md p-0.5 backdrop-blur-xs">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateSkillInFolder(node.relativePath);
                    }}
                    className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                    title="Criar nova skill nesta pasta"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateSubfolder(node.relativePath);
                    }}
                    className="p-1 hover:text-amber-600 dark:hover:text-amber-400 rounded"
                    title="Criar subpasta"
                  >
                    <Folder className="w-3 h-3" />
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt(
                    `Novo nome para ${isFolder ? "pasta" : "skill"}:`,
                    node.name.replace(".json", "")
                  );
                  if (newName && newName.trim()) {
                    onRenameItem(node.relativePath, newName.trim(), isFolder ? "folder" : "file");
                  }
                }}
                className="p-1 hover:text-cyan-600 dark:hover:text-cyan-400 rounded"
                title="Renomear"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Tem certeza que deseja excluir ${
                        isFolder ? "a pasta '" + node.name + "' e seu conteúdo" : "a skill '" + node.name + "'"
                      }?`
                    )
                  ) {
                    onDeleteItem(node.relativePath, isFolder ? "folder" : "file");
                  }
                }}
                className="p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                title="Excluir"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedSkillId={selectedSkillId}
              selectedFolderPath={selectedFolderPath}
              accent={accent}
              onSelectSkill={onSelectSkill}
              onSelectFolder={onSelectFolder}
              onCreateSkillInFolder={onCreateSkillInFolder}
              onCreateSubfolder={onCreateSubfolder}
              onRenameItem={onRenameItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

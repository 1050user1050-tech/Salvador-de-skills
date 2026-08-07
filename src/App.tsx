import React, { useState, useEffect, useMemo } from "react";
import { FileTreeNode, GitConfig, Skill, ThemeConfig, AccentColor } from "./types/skill";
import { StorageService } from "./services/storageService";
import { GitService } from "./services/gitService";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SkillDetail } from "./components/SkillDetail";
import { NotificationToast, ToastMessage } from "./components/NotificationToast";
import { SettingsModal } from "./components/SettingsModal";
import { SkillFormModal } from "./components/SkillFormModal";
import { FolderFormModal } from "./components/FolderFormModal";
import { PromptPlaygroundModal } from "./components/PromptPlaygroundModal";
import { Dashboard } from "./components/Dashboard";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { RenameModal } from "./components/RenameModal";
import { Sparkles, FolderOpen, FileCode, Layers, Plus } from "lucide-react";
import { ACCENT_COLORS } from "./utils/accentColors";
import {
  DualTonePalette,
  applyDualTonePalette,
  loadSavedPalette
} from "./utils/themeService";

export default function App() {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [storagePath, setStoragePath] = useState("./storage/skills");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSkillRelPath, setSelectedSkillRelPath] = useState<string>("");
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Dual-Tone Palette State
  const [palette, setPalette] = useState<DualTonePalette>(() => loadSavedPalette());

  // Apply palette initially and whenever it changes
  useEffect(() => {
    applyDualTonePalette(palette);
  }, [palette]);

  const handleUpdatePalette = (newPalette: DualTonePalette) => {
    setPalette(newPalette);
    applyDualTonePalette(newPalette);
  };

  // Theme configuration state
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem("prompt_studio_theme_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      mode: "light",
      accent: "indigo",
      storagePath: "./storage/skills"
    };
  });

  // Git configuration state
  const [gitConfig, setGitConfig] = useState<GitConfig | null>(null);
  const [isSyncingGit, setIsSyncingGit] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewSkillModalOpen, setIsNewSkillModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [editingSkillMetadata, setEditingSkillMetadata] = useState<Skill | null>(null);
  const [playgroundData, setPlaygroundData] = useState<{ promptText: string; title: string } | null>(null);

  // Custom Delete & Rename Confirmation Modal States
  const [itemToDelete, setItemToDelete] = useState<{
    relativePath: string;
    displayName: string;
    type: "file" | "folder";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [itemToRename, setItemToRename] = useState<{
    oldRelativePath: string;
    currentName: string;
    type: "file" | "folder";
  } | null>(null);

  // Helper to add toast messages
  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Tree and Git configuration on mount
  const loadTree = async () => {
    const data = await StorageService.getTree();
    setTree(data.tree);
    setStoragePath(data.storagePath);

    // If no selected skill yet, auto-select first skill found in tree
    if (!selectedSkill) {
      const findFirstSkill = (nodes: FileTreeNode[]): { skill: Skill; relPath: string } | null => {
        for (const n of nodes) {
          if (n.type === "file" && n.data) {
            return { skill: n.data, relPath: n.relativePath };
          }
          if (n.children) {
            const found = findFirstSkill(n.children);
            if (found) return found;
          }
        }
        return null;
      };

      const first = findFirstSkill(data.tree);
      if (first) {
        setSelectedSkill(first.skill);
        setSelectedSkillRelPath(first.relPath);
      }
    }
  };

  useEffect(() => {
    loadTree();
    GitService.getStatus().then((cfg) => {
      if (cfg) setGitConfig(cfg);
    });
  }, []);

  // Save theme config
  useEffect(() => {
    localStorage.setItem("prompt_studio_theme_config", JSON.stringify(themeConfig));
  }, [themeConfig]);

  // Extract list of existing folder relative paths for dropdowns
  const existingFolders = useMemo(() => {
    const folderList: string[] = [];
    const extractFolders = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.type === "folder") {
          folderList.push(n.relativePath);
          if (n.children) extractFolders(n.children);
        }
      });
    };
    extractFolders(tree);
    return folderList;
  }, [tree]);

  // Calculate total count of skills
  const totalSkillsCount = useMemo(() => {
    let count = 0;
    const countNodes = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.type === "file") count++;
        if (n.children) countNodes(n.children);
      });
    };
    countNodes(tree);
    return count;
  }, [tree]);

  // Handler: Select a Skill
  const handleSelectSkill = (skill: Skill, relPath: string) => {
    setSelectedSkill(skill);
    setSelectedSkillRelPath(relPath);
  };

  // Handler: Select a Folder
  const handleSelectFolder = (folderPath: string) => {
    setSelectedFolderPath(folderPath);
  };

  // Handler: Copy Prompt Text
  const handleCopyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("success", "Prompt Copiado!", "O texto do prompt foi copiado para a área de transferência.");
  };

  // Handler: Copy Complete JSON File
  const handleCopyCompleteJson = (skillData: Skill) => {
    const jsonString = JSON.stringify(skillData, null, 2);
    navigator.clipboard.writeText(jsonString);
    addToast("success", "JSON Copiado!", "O arquivo JSON completo da skill foi copiado.");
  };

  // Handler: Save Current Version Prompt Content
  const handleSaveCurrentVersionPrompt = async (promptText: string, versionName: string) => {
    if (!selectedSkill) return;

    const updatedVersoes = selectedSkill.versoes.map((v) => {
      if (v.versao === versionName) {
        return { ...v, conteudo_do_prompt: promptText, data: new Date().toISOString() };
      }
      return v;
    });

    const updatedSkill: Skill = {
      ...selectedSkill,
      versoes: updatedVersoes
    };

    const dirParts = selectedSkillRelPath.split("/");
    const filename = dirParts.pop() || `${selectedSkill.id}.json`;
    const folderRelPath = dirParts.join("/");

    await StorageService.saveSkill(folderRelPath, filename, updatedSkill);
    setSelectedSkill(updatedSkill);
    await loadTree();
    addToast("success", `Versão ${versionName} Atualizada!`, "As alterações no prompt foram salvas.");
  };

  // Handler: Create New Version Prompt
  const handleSaveNewVersionPrompt = async (
    promptText: string,
    newVersionName: string,
    changelog: string
  ) => {
    if (!selectedSkill) return;

    const newVersionObj = {
      versao: newVersionName,
      data: new Date().toISOString(),
      conteudo_do_prompt: promptText,
      changelog: changelog || "Nova versão gravada pelo editor"
    };

    const updatedSkill: Skill = {
      ...selectedSkill,
      versoes: [...selectedSkill.versoes, newVersionObj]
    };

    const dirParts = selectedSkillRelPath.split("/");
    const filename = dirParts.pop() || `${selectedSkill.id}.json`;
    const folderRelPath = dirParts.join("/");

    await StorageService.saveSkill(folderRelPath, filename, updatedSkill);
    setSelectedSkill(updatedSkill);
    await loadTree();
    addToast("success", `Versão ${newVersionName} Criada!`, "O histórico de versões foi atualizado com sucesso.");
  };

  // Request Deletion (Opens Confirmation Modal)
  const requestDeleteSkill = (relPath: string, displayName?: string) => {
    const name = displayName || relPath.split("/").pop() || relPath;
    setItemToDelete({
      relativePath: relPath,
      displayName: name,
      type: "file"
    });
  };

  const requestDeleteFolder = (relPath: string, displayName?: string) => {
    const name = displayName || relPath.split("/").pop() || relPath;
    setItemToDelete({
      relativePath: relPath,
      displayName: name,
      type: "folder"
    });
  };

  // Perform Deletion After User Confirms in Modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === "file") {
        await StorageService.deleteSkill(itemToDelete.relativePath);
        addToast(
          "info",
          "Skill Excluída",
          `A skill '${itemToDelete.displayName}' e todo o seu conteúdo foram excluídos.`
        );
      } else {
        await StorageService.deleteFolder(itemToDelete.relativePath);
        addToast(
          "info",
          "Pasta Excluída",
          `A pasta '${itemToDelete.displayName}' e todos os arquivos contidos foram removidos.`
        );
      }

      // If deleted item is currently selected (or folder contains selected skill), clear selection
      const isSelectedTarget =
        selectedSkillRelPath === itemToDelete.relativePath ||
        selectedSkillRelPath.startsWith(itemToDelete.relativePath + "/");

      if (isSelectedTarget) {
        setSelectedSkill(null);
        setSelectedSkillRelPath("");
      }

      // Reload fresh tree
      const data = await StorageService.getTree();
      setTree(data.tree);
      setStoragePath(data.storagePath);

      // If selected skill was cleared, auto-select first available skill from fresh tree if present
      if (isSelectedTarget) {
        const findFirstSkill = (nodes: FileTreeNode[]): { skill: Skill; relPath: string } | null => {
          for (const n of nodes) {
            if (n.type === "file" && n.data) {
              return { skill: n.data, relPath: n.relativePath };
            }
            if (n.children) {
              const found = findFirstSkill(n.children);
              if (found) return found;
            }
          }
          return null;
        };

        const first = findFirstSkill(data.tree);
        if (first) {
          setSelectedSkill(first.skill);
          setSelectedSkillRelPath(first.relPath);
        }
      }
    } catch (err: any) {
      addToast("error", "Erro ao Excluir", err.message || "Falha ao excluir o registro.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Handler: Create Folder
  const handleCreateFolder = async (folderPath: string) => {
    await StorageService.createFolder(folderPath);
    await loadTree();
    addToast("success", "Pasta Criada", `A pasta '${folderPath}' foi criada no repositório.`);
  };

  // Request Rename (Opens Rename Modal)
  const requestRenameItem = (relativePath: string, currentName: string, type: "file" | "folder") => {
    setItemToRename({
      oldRelativePath: relativePath,
      currentName,
      type
    });
  };

  // Perform Rename After User Submits Modal
  const handleConfirmRename = async (newName: string) => {
    if (!itemToRename) return;

    try {
      await StorageService.renameItem(itemToRename.oldRelativePath, newName, itemToRename.type);
      const data = await StorageService.getTree();
      setTree(data.tree);

      if (selectedSkillRelPath === itemToRename.oldRelativePath) {
        const dirParts = itemToRename.oldRelativePath.split("/");
        dirParts.pop();
        const cleanName = newName.endsWith(".json") ? newName : `${newName}.json`;
        const newRel = dirParts.length > 0 ? `${dirParts.join("/")}/${cleanName}` : cleanName;
        setSelectedSkillRelPath(newRel);
        if (selectedSkill) {
          setSelectedSkill({ ...selectedSkill, titulo: newName.replace(/\.json$/, "") });
        }
      }

      addToast("success", "Item Renomeado", `Nome alterado para '${newName}'.`);
    } catch (err: any) {
      addToast("error", "Erro ao Renomear", err.message || "Não foi possível renomear o item.");
    } finally {
      setItemToRename(null);
    }
  };

  // Handler: Save / Create Skill from Form Modal
  const handleSaveSkillForm = async (skillData: Partial<Skill>, folderRelPath: string) => {
    let finalSkill: Skill;
    let filename: string;

    if (editingSkillMetadata) {
      finalSkill = {
        ...editingSkillMetadata,
        ...skillData,
      } as Skill;

      const dirParts = selectedSkillRelPath.split("/");
      filename = dirParts.pop() || `${finalSkill.id}.json`;
    } else {
      const id = skillData.id || `skill_${Date.now()}`;
      finalSkill = {
        id,
        titulo: skillData.titulo || "Nova Skill",
        descricao: skillData.descricao || "",
        link_github: skillData.link_github || "",
        tags: skillData.tags || [],
        versoes: [
          {
            versao: "v1.0",
            data: new Date().toISOString(),
            conteudo_do_prompt: skillData.versoes?.[0]?.conteudo_do_prompt || "# Título do Prompt\n\nDescreva as instruções aqui...",
            changelog: "Versão inicial criada"
          }
        ]
      };
      filename = `${id}.json`;
    }

    const savedRelPath = await StorageService.saveSkill(folderRelPath, filename, finalSkill);
    await loadTree();
    setSelectedSkill(finalSkill);
    setSelectedSkillRelPath(savedRelPath);

    setIsNewSkillModalOpen(false);
    setEditingSkillMetadata(null);
    addToast("success", editingSkillMetadata ? "Skill Atualizada!" : "Nova Skill Criada!", `Salvo no caminho '${savedRelPath}'.`);
  };

  // Handler: Git Manual Sync
  const handleSyncGit = async (manual = true) => {
    setIsSyncingGit(true);
    try {
      const res = await GitService.syncRepo(gitConfig?.repoUrl || "", gitConfig?.branch || "main");
      if (res.success) {
        if (manual) {
          addToast("success", "Sincronização Git Concluída!", res.message);
        }
        const updatedConfig = await GitService.getStatus();
        if (updatedConfig) setGitConfig(updatedConfig);
        await loadTree();
      } else {
        addToast("error", "Falha na Sincronização Git", res.message);
      }
    } catch (e: any) {
      addToast("error", "Erro ao Sincronizar Git", e.message || "Tente novamente.");
    } finally {
      setIsSyncingGit(false);
    }
  };

  // Handler: Update Git Config
  const handleUpdateGitConfig = async (cfg: Partial<GitConfig>) => {
    const updated = await GitService.saveConfig(cfg);
    setGitConfig(updated);
    addToast("success", "Configurações Git Salvas", "As preferências do repositório remoto foram atualizadas.");
  };

  // Handler: Export All Data as JSON
  const handleExportAllJson = async () => {
    const jsonStr = await StorageService.exportAll();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-skills-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Backup Concluído", "O arquivo JSON com todas as skills foi baixado.");
  };

  // Handler: Import JSON File
  const handleImportJsonFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.id && item.titulo && item.versoes) {
            await StorageService.saveSkill("", `${item.id}.json`, item);
          }
        }
        addToast("success", "Importação em Lote Concluída", `${parsed.length} skills foram importadas.`);
      } else if (parsed.id && parsed.titulo && parsed.versoes) {
        await StorageService.saveSkill("", `${parsed.id}.json`, parsed);
        addToast("success", "Skill Importada", `A skill '${parsed.titulo}' foi adicionada ao repositório.`);
      } else {
        addToast("error", "Formato Inválido", "O arquivo JSON selecionado não possui a estrutura requerida de skills.");
      }
      await loadTree();
    } catch (e) {
      addToast("error", "Erro ao Ler JSON", "Verifique se o arquivo possui formatação JSON válida.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden custom-app-bg text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Top Application Bar */}
      <Navbar
        storagePath={storagePath}
        gitBranch={gitConfig?.branch || "main"}
        lastGitSync={gitConfig?.lastSyncTime}
        onSyncGit={() => handleSyncGit(true)}
        isSyncingGit={isSyncingGit}
        totalSkillsCount={totalSkillsCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Retractable Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          tree={tree}
          selectedSkillId={selectedSkill?.id || null}
          selectedFolderPath={selectedFolderPath}
          accentColor={themeConfig.accent}
          gitConfig={gitConfig}
          onGoToDashboard={() => {
            setSelectedSkill(null);
            setSelectedSkillRelPath("");
          }}
          onSelectSkill={handleSelectSkill}
          onSelectFolder={handleSelectFolder}
          onCreateSkillInFolder={(folderRel) => {
            setSelectedFolderPath(folderRel);
            setIsNewSkillModalOpen(true);
          }}
          onCreateSubfolder={(parentRel) => {
            setSelectedFolderPath(parentRel);
            setIsNewFolderModalOpen(true);
          }}
          onRenameItem={(relPath, name, type) => {
            requestRenameItem(relPath, name, type);
          }}
          onDeleteItem={(relPath, type, displayName) => {
            if (type === "file") requestDeleteSkill(relPath, displayName);
            else requestDeleteFolder(relPath, displayName);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewSkillModal={() => setIsNewSkillModalOpen(true)}
          onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {/* Right Main Content Workspace */}
        <main className="flex-1 flex flex-col h-full overflow-hidden custom-app-bg relative">
          {selectedSkill ? (
            <SkillDetail
              skill={selectedSkill}
              relativePath={selectedSkillRelPath}
              accentColor={themeConfig.accent}
              onCopyPromptText={handleCopyPromptText}
              onCopyCompleteJson={handleCopyCompleteJson}
              onSaveCurrentVersionPrompt={handleSaveCurrentVersionPrompt}
              onSaveNewVersionPrompt={handleSaveNewVersionPrompt}
              onDeleteSkill={(relPath, name) => requestDeleteSkill(relPath, name)}
              onEditSkillMetadata={(sk) => setEditingSkillMetadata(sk)}
              onOpenPlayground={(promptText, title) =>
                setPlaygroundData({ promptText, title })
              }
            />
          ) : (
            /* Dashboard / Home Screen when no skill is selected */
            <Dashboard
              tree={tree}
              accentColor={themeConfig.accent}
              onSelectSkill={handleSelectSkill}
              onOpenNewSkillModal={() => setIsNewSkillModalOpen(true)}
              onDeleteSkill={(relPath, name) => requestDeleteSkill(relPath, name)}
            />
          )}
        </main>
      </div>

      {/* Confirm Delete Modal */}
      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(itemToDelete)}
          itemName={itemToDelete.displayName}
          itemType={itemToDelete.type}
          relativePath={itemToDelete.relativePath}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setItemToDelete(null)}
        />
      )}

      {/* Rename Item Modal */}
      {itemToRename && (
        <RenameModal
          isOpen={Boolean(itemToRename)}
          currentName={itemToRename.currentName}
          itemType={itemToRename.type}
          relativePath={itemToRename.oldRelativePath}
          onRename={handleConfirmRename}
          onClose={() => setItemToRename(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          themeConfig={themeConfig}
          onUpdateTheme={(cfg) => setThemeConfig((prev) => ({ ...prev, ...cfg }))}
          palette={palette}
          onUpdatePalette={handleUpdatePalette}
          gitConfig={gitConfig}
          onUpdateGitConfig={handleUpdateGitConfig}
          onSyncGitNow={() => handleSyncGit(true)}
          isSyncingGit={isSyncingGit}
          onClose={() => setIsSettingsOpen(false)}
          onExportAllJson={handleExportAllJson}
          onImportJsonFile={handleImportJsonFile}
        />
      )}

      {/* New / Edit Skill Modal */}
      {(isNewSkillModalOpen || editingSkillMetadata) && (
        <SkillFormModal
          initialSkill={editingSkillMetadata || undefined}
          defaultFolder={selectedFolderPath}
          existingFolders={existingFolders}
          accentColor={themeConfig.accent}
          onClose={() => {
            setIsNewSkillModalOpen(false);
            setEditingSkillMetadata(null);
          }}
          onSave={handleSaveSkillForm}
        />
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <FolderFormModal
          parentFolder={selectedFolderPath}
          existingFolders={existingFolders}
          accentColor={themeConfig.accent}
          onClose={() => setIsNewFolderModalOpen(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {/* Prompt Playground Modal */}
      {playgroundData && (
        <PromptPlaygroundModal
          promptText={playgroundData.promptText}
          skillTitle={playgroundData.title}
          accentColor={themeConfig.accent}
          onClose={() => setPlaygroundData(null)}
          onCopyText={handleCopyPromptText}
        />
      )}

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

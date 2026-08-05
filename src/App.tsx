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
import { Sparkles, FolderOpen, FileCode, Layers, Plus } from "lucide-react";
import { ACCENT_COLORS } from "./utils/accentColors";

export default function App() {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [storagePath, setStoragePath] = useState("./storage/skills");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSkillRelPath, setSelectedSkillRelPath] = useState<string>("");
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  // Sync theme mode (dark/light) to <html> tag
  useEffect(() => {
    localStorage.setItem("prompt_studio_theme_config", JSON.stringify(themeConfig));
    const root = document.documentElement;

    if (themeConfig.mode === "dark") {
      root.classList.add("dark");
    } else if (themeConfig.mode === "light") {
      root.classList.remove("dark");
    } else {
      // System mode
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
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

  // Handler: Save New Version
  const handleSaveNewVersionPrompt = async (promptText: string, newVersionName: string) => {
    if (!selectedSkill) return;

    const newVersionObj = {
      versao: newVersionName,
      data: new Date().toISOString(),
      conteudo_do_prompt: promptText
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
    addToast("success", `Nova Versão ${newVersionName} Criada!`, "O histórico de versões foi atualizado.");
  };

  // Handler: Create/Save Skill from Form Modal
  const handleSaveSkillForm = async (skillData: Partial<Skill>, folderRelPath: string, filename: string) => {
    const fullSkill: Skill = {
      id: skillData.id || `skill_${Date.now()}`,
      titulo: skillData.titulo || "Nova Skill",
      descricao: skillData.descricao || "",
      link_github: skillData.link_github,
      tags: skillData.tags || ["prompt"],
      versoes: skillData.versoes || [
        {
          versao: "v1.0",
          data: new Date().toISOString(),
          conteudo_do_prompt: "Você é um especialista..."
        }
      ]
    };

    await StorageService.saveSkill(folderRelPath, filename, fullSkill);
    const newRelPath = folderRelPath ? `${folderRelPath}/${filename}` : filename;

    await loadTree();
    setSelectedSkill(fullSkill);
    setSelectedSkillRelPath(newRelPath);
    setIsNewSkillModalOpen(false);
    setEditingSkillMetadata(null);
    addToast("success", "Skill Salva com Sucesso!", `Arquivo salvo em /${newRelPath}`);
  };

  // Handler: Delete Skill
  const handleDeleteSkill = async (relPath: string) => {
    await StorageService.deleteSkill(relPath);
    if (selectedSkillRelPath === relPath) {
      setSelectedSkill(null);
      setSelectedSkillRelPath("");
    }
    await loadTree();
    addToast("info", "Skill Excluída", "O arquivo JSON foi removido do diretório.");
  };

  // Handler: Create Folder
  const handleCreateFolder = async (parentFolder: string, folderName: string) => {
    await StorageService.createFolder(parentFolder, folderName);
    setIsNewFolderModalOpen(false);
    await loadTree();
    addToast("success", "Pasta Criada!", `Nova pasta criada em /${parentFolder ? parentFolder + "/" : ""}${folderName}`);
  };

  // Handler: Delete Folder
  const handleDeleteFolder = async (relPath: string) => {
    await StorageService.deleteFolder(relPath);
    await loadTree();
    addToast("info", "Pasta Excluída", "A pasta e seu conteúdo foram removidos.");
  };

  // Handler: Rename File or Folder
  const handleRenameItem = async (oldRelPath: string, newName: string, type: "file" | "folder") => {
    await StorageService.renameItem(oldRelPath, newName, type);
    await loadTree();
    addToast("success", "Item Renomeado!", `Atualizado para ${newName}`);
  };

  // Handler: Update Git Config
  const handleUpdateGitConfig = async (newCfg: Partial<GitConfig>) => {
    setGitConfig((prev) => (prev ? { ...prev, ...newCfg } : (newCfg as GitConfig)));
    const res = await GitService.saveConfig(newCfg);
    if (res.success) {
      addToast("success", "Configurações Git Salvas!", "Parâmetros e agendamento de sincronização atualizados.");
      if (res.config) setGitConfig(res.config);
    }
  };

  // Handler: Git Sync Action (manual or automated)
  const handleSyncGit = async (isAuto = false) => {
    setIsSyncingGit(true);
    const res = await GitService.syncRepo(
      gitConfig?.repoUrl || "https://github.com/my-org/ai-skills-repository.git",
      gitConfig?.branch || "main",
      isAuto ? `Auto-Sync Agendado: (${new Date().toLocaleTimeString("pt-BR")})` : undefined
    );
    setIsSyncingGit(false);

    if (res.success) {
      if (isAuto) {
        addToast("info", "Git Auto-Sync Concluído", `Sincronização agendada realizada com sucesso (${gitConfig?.autoSyncIntervalMinutes || 60}m).`);
      } else {
        addToast("success", "Sincronização Git Concluída!", res.message);
      }
      const updatedGit = await GitService.getStatus();
      if (updatedGit) setGitConfig(updatedGit);
    } else {
      addToast("error", "Erro na Sincronização Git", res.message);
    }
  };

  // Scheduled Git Auto-Sync Engine
  useEffect(() => {
    if (!gitConfig?.autoSync) return;

    const intervalMinutes = gitConfig.autoSyncIntervalMinutes || 60; // Default 1 hour
    const intervalMs = intervalMinutes * 60 * 1000;

    const autoSyncTimer = setInterval(() => {
      handleSyncGit(true);
    }, intervalMs);

    return () => clearInterval(autoSyncTimer);
  }, [
    gitConfig?.autoSync,
    gitConfig?.autoSyncIntervalMinutes,
    gitConfig?.repoUrl,
    gitConfig?.branch
  ]);

  // Handler: Export Backup JSON
  const handleExportAllJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tree, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skills_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("success", "Backup Exportado!", "Arquivo de backup em lote JSON baixado com sucesso.");
  };

  // Handler: Import JSON File
  const handleImportJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.id && parsed.titulo && parsed.versoes) {
          const filename = `${parsed.id}.json`;
          await StorageService.saveSkill("", filename, parsed);
          await loadTree();
          setSelectedSkill(parsed);
          setSelectedSkillRelPath(filename);
          setIsSettingsOpen(false);
          addToast("success", "Skill Importada!", `Skill '${parsed.titulo}' foi adicionada.`);
        } else {
          addToast("error", "Formato Inválido", "O arquivo JSON importado não possui a estrutura válida de Skill.");
        }
      } catch (err) {
        addToast("error", "Erro ao Importar", "Não foi possível ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const accent = ACCENT_COLORS[themeConfig.accent] || ACCENT_COLORS.indigo;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased select-none">
      {/* Top Application Bar */}
      <Navbar
        storagePath={storagePath}
        themeConfig={themeConfig}
        onUpdateTheme={(cfg) => setThemeConfig((prev) => ({ ...prev, ...cfg }))}
        gitBranch={gitConfig?.branch || "main"}
        lastGitSync={gitConfig?.lastSyncTime}
        onSyncGit={handleSyncGit}
        isSyncingGit={isSyncingGit}
        totalSkillsCount={totalSkillsCount}
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
          onRenameItem={handleRenameItem}
          onDeleteItem={(relPath, type) => {
            if (type === "file") handleDeleteSkill(relPath);
            else handleDeleteFolder(relPath);
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
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950 relative">
          {selectedSkill ? (
            <SkillDetail
              skill={selectedSkill}
              relativePath={selectedSkillRelPath}
              accentColor={themeConfig.accent}
              onCopyPromptText={handleCopyPromptText}
              onCopyCompleteJson={handleCopyCompleteJson}
              onSaveCurrentVersionPrompt={handleSaveCurrentVersionPrompt}
              onSaveNewVersionPrompt={handleSaveNewVersionPrompt}
              onDeleteSkill={handleDeleteSkill}
              onEditSkillMetadata={(sk) => setEditingSkillMetadata(sk)}
              onOpenPlayground={(promptText, title) =>
                setPlaygroundData({ promptText, title })
              }
            />
          ) : (
            /* Empty State when no skill is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md mx-auto">
              <div className={`p-4 rounded-2xl ${accent.badgeBg} ${accent.primaryText} shadow-md`}>
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Nenhuma Skill Selecionada
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Selecione uma skill na árvore da barra lateral ou crie um novo arquivo de prompt em formato `.json` para começar a editar e gerenciar suas versões.
              </p>
              <button
                onClick={() => setIsNewSkillModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs ${accent.primaryBg} transition flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Skill
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          themeConfig={themeConfig}
          onUpdateTheme={(cfg) => setThemeConfig((prev) => ({ ...prev, ...cfg }))}
          gitConfig={gitConfig}
          onUpdateGitConfig={handleUpdateGitConfig}
          onSyncGitNow={() => handleSyncGit(false)}
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

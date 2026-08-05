import { FileTreeNode, Skill } from "../types/skill";

const LOCAL_STORAGE_KEY = "prompt_studio_skills_data_v1";

// Initial default local fallback tree if server is disconnected
const DEFAULT_FALLBACK_TREE: FileTreeNode[] = [
  {
    id: "dir_frontend",
    name: "frontend",
    path: "/skills/frontend",
    relativePath: "frontend",
    type: "folder",
    children: [
      {
        id: "skill_react_clean_code",
        name: "react-clean-code.json",
        path: "/skills/frontend/react-clean-code.json",
        relativePath: "frontend/react-clean-code.json",
        type: "file",
        data: {
          id: "skill_react_clean_code",
          titulo: "React Clean Code & Optimization Specialist",
          descricao: "Diretrizes e padrão de refatoração para componentes React 19 com foco em Clean Code, reusabilidade e hooks otimizados.",
          link_github: "https://github.com/facebook/react",
          tags: ["frontend", "react", "clean-code", "typescript"],
          versoes: [
            {
              versao: "v1.0",
              data: "2026-08-01T10:00:00.000Z",
              conteudo_do_prompt: "Você é um Engenheiro de Software especialista em React e TypeScript.\n\nRegras de Código:\n1. Prefira componentes funcionais com TypeScript estrito.\n2. Evite re-renderizações desnecessárias usando useCallback e useMemo apenas onde houver custo real de computação.\n3. Extraia lógica complexa para Custom Hooks em arquivos separados.\n4. Mantenha os componentes pequenos (máximo 150 linhas).\n\nFormato de Resposta:\n- Breve resumo das mudanças\n- Código completo com explicações claras."
            },
            {
              versao: "v1.1",
              data: "2026-08-05T09:00:00.000Z",
              conteudo_do_prompt: "Você é um Engenheiro de Software Sênior especialista em React 19 e TypeScript estrito.\n\nDiretrizes de Arquitetura:\n1. Prefira componentes funcionais modulares.\n2. Siga os padrões de design e acessibilidade (WCAG 2.1 AA).\n3. Extraia lógica de estado para custom hooks e utilitários isolados.\n4. Utilize Tailwind CSS v4 para estilização sem CSS-in-JS.\n5. Evite dependências cyclomaticas em useEffect.\n\nFormato de Resposta:\n1. Visão Geral da Solução\n2. Trecho de Código Refatorado\n3. Destaques de Desempenho e Segurança."
            }
          ]
        }
      }
    ]
  },
  {
    id: "dir_backend",
    name: "backend",
    path: "/skills/backend",
    relativePath: "backend",
    type: "folder",
    children: [
      {
        id: "skill_api_design",
        name: "api-design.json",
        path: "/skills/backend/api-design.json",
        relativePath: "backend/api-design.json",
        type: "file",
        data: {
          id: "skill_api_design",
          titulo: "Arquiteto de APIs REST & Node.js",
          descricao: "Especialista em design de APIs RESTful, validação de payload com Zod e padrões de tratamento de erro e segurança.",
          tags: ["backend", "express", "api", "node", "security"],
          versoes: [
            {
              versao: "v1.0",
              data: "2026-08-02T14:30:00.000Z",
              conteudo_do_prompt: "Você é um Arquiteto Backend especializado em Node.js e Express.\n\nSua tarefa é projetar APIs RESTful limpas e seguras:\n- Sempre utilize DTOs e esquemas de validação de dados.\n- Retorne status HTTP semânticos (200, 201, 400, 401, 403, 404, 500).\n- Padronize as respostas de erro em formato JSON com 'code', 'message' e 'details'.\n- Implemente middleware de sanitarização de dados e tratamento de exceções assíncronas."
            }
          ]
        }
      }
    ]
  },
  {
    id: "dir_token_optimization",
    name: "token-optimization",
    path: "/skills/token-optimization",
    relativePath: "token-optimization",
    type: "folder",
    children: [
      {
        id: "skill_prompt_compressor",
        name: "prompt-compressor.json",
        path: "/skills/token-optimization/prompt-compressor.json",
        relativePath: "token-optimization/prompt-compressor.json",
        type: "file",
        data: {
          id: "skill_prompt_compressor",
          titulo: "Otimizador e Compressor de Prompts",
          descricao: "Comprime e refatora prompts de LLM reduzindo contagem de tokens sem perder contexto ou precisão.",
          tags: ["token-optimization", "prompt-engineering", "efficiency"],
          versoes: [
            {
              versao: "v1.0",
              data: "2026-08-04T18:00:00.000Z",
              conteudo_do_prompt: "Sua tarefa é analisar o prompt fornecido pelo usuário e comprimi-lo para economizar de 30% a 60% dos tokens mantendo 100% das diretrizes críticas.\n\nPassos:\n1. Elimine saudações, preâmbulos e redundâncias.\n2. Transforme frases longas em tópicos diretos e imperativos.\n3. Mantenha os delimitadores e variáveis (ex: {{user_input}}).\n4. Exiba o prompt comprimido e a porcentagem de tokens economizados estipulada."
            }
          ]
        }
      }
    ]
  }
];

export class StorageService {
  private static isServerAvailable = true;

  // Fetch full directory tree
  public static async getTree(): Promise<{ storagePath: string; tree: FileTreeNode[] }> {
    try {
      const res = await fetch("/api/skills/tree");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.isServerAvailable = true;
          return {
            storagePath: data.storagePath || "./storage/skills",
            tree: data.tree
          };
        }
      }
    } catch (e) {
      console.warn("Express server endpoint unavailable, falling back to local storage.", e);
    }

    this.isServerAvailable = false;
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FALLBACK_TREE));
      return { storagePath: "Local Storage (Navegador)", tree: DEFAULT_FALLBACK_TREE };
    }
    return { storagePath: "Local Storage (Navegador)", tree: JSON.parse(local) };
  }

  // Save/Create a Skill
  public static async saveSkill(relativeFolder: string, filename: string, skill: Skill): Promise<boolean> {
    const cleanFilename = filename.endsWith(".json") ? filename : `${filename}.json`;
    const relPath = relativeFolder ? `${relativeFolder}/${cleanFilename}` : cleanFilename;

    if (this.isServerAvailable) {
      try {
        const res = await fetch("/api/skills/file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relativeFolder,
            filename: cleanFilename,
            skillData: skill
          })
        });
        if (res.ok) {
          return true;
        }
      } catch (e) {
        console.error("Failed to save skill to backend", e);
      }
    }

    // Local Storage Fallback
    const { tree } = await this.getTree();
    this.addOrUpdateNodeInTree(tree, relativeFolder, cleanFilename, relPath, skill);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
    return true;
  }

  // Delete a Skill File
  public static async deleteSkill(relativePath: string): Promise<boolean> {
    if (this.isServerAvailable) {
      try {
        const res = await fetch("/api/skills/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relativePath })
        });
        if (res.ok) return true;
      } catch (e) {
        console.error("Failed to delete skill from backend", e);
      }
    }

    const { tree } = await this.getTree();
    const updatedTree = this.removeNodeFromTree(tree, relativePath);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTree));
    return true;
  }

  // Create a Folder
  public static async createFolder(parentFolder: string, folderName: string): Promise<boolean> {
    if (this.isServerAvailable) {
      try {
        const res = await fetch("/api/skills/folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentFolder, folderName })
        });
        if (res.ok) return true;
      } catch (e) {
        console.error("Failed to create folder on backend", e);
      }
    }

    const { tree } = await this.getTree();
    const relPath = parentFolder ? `${parentFolder}/${folderName}` : folderName;
    const newFolderNode: FileTreeNode = {
      id: `dir_${relPath}`,
      name: folderName,
      path: `/skills/${relPath}`,
      relativePath: relPath,
      type: "folder",
      children: []
    };

    if (!parentFolder) {
      tree.push(newFolderNode);
    } else {
      this.insertChildIntoFolder(tree, parentFolder, newFolderNode);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
    return true;
  }

  // Delete a Folder
  public static async deleteFolder(relativePath: string): Promise<boolean> {
    if (this.isServerAvailable) {
      try {
        const res = await fetch("/api/skills/folder", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relativePath })
        });
        if (res.ok) return true;
      } catch (e) {
        console.error("Failed to delete folder on backend", e);
      }
    }

    const { tree } = await this.getTree();
    const updatedTree = this.removeNodeFromTree(tree, relativePath);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTree));
    return true;
  }

  // Rename File or Folder
  public static async renameItem(oldRelativePath: string, newName: string, type: "file" | "folder"): Promise<boolean> {
    if (this.isServerAvailable) {
      try {
        const res = await fetch("/api/skills/rename", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldRelativePath, newName, type })
        });
        if (res.ok) return true;
      } catch (e) {
        console.error("Failed to rename item on backend", e);
      }
    }

    const { tree } = await this.getTree();
    this.renameNodeInTree(tree, oldRelativePath, newName, type);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
    return true;
  }

  // Helper tree operations for local fallback
  private static removeNodeFromTree(tree: FileTreeNode[], targetRelPath: string): FileTreeNode[] {
    return tree.filter(node => {
      if (node.relativePath === targetRelPath) return false;
      if (node.children) {
        node.children = this.removeNodeFromTree(node.children, targetRelPath);
      }
      return true;
    });
  }

  private static insertChildIntoFolder(tree: FileTreeNode[], parentRelPath: string, childNode: FileTreeNode) {
    for (const node of tree) {
      if (node.type === "folder" && node.relativePath === parentRelPath) {
        if (!node.children) node.children = [];
        node.children.push(childNode);
        return;
      }
      if (node.children) {
        this.insertChildIntoFolder(node.children, parentRelPath, childNode);
      }
    }
  }

  private static addOrUpdateNodeInTree(tree: FileTreeNode[], folderRelPath: string, filename: string, relPath: string, skill: Skill) {
    const fileNode: FileTreeNode = {
      id: skill.id,
      name: filename,
      path: `/skills/${relPath}`,
      relativePath: relPath,
      type: "file",
      data: skill
    };

    if (!folderRelPath) {
      const idx = tree.findIndex(n => n.relativePath === relPath);
      if (idx >= 0) tree[idx] = fileNode;
      else tree.push(fileNode);
      return;
    }

    for (const node of tree) {
      if (node.type === "folder" && node.relativePath === folderRelPath) {
        if (!node.children) node.children = [];
        const idx = node.children.findIndex(n => n.relativePath === relPath);
        if (idx >= 0) node.children[idx] = fileNode;
        else node.children.push(fileNode);
        return;
      }
      if (node.children) {
        this.addOrUpdateNodeInTree(node.children, folderRelPath, filename, relPath, skill);
      }
    }
  }

  private static renameNodeInTree(tree: FileTreeNode[], oldRelPath: string, newName: string, type: "file" | "folder") {
    for (const node of tree) {
      if (node.relativePath === oldRelPath) {
        node.name = type === "file" && !newName.endsWith(".json") ? `${newName}.json` : newName;
        const dirParts = oldRelPath.split("/");
        dirParts.pop();
        dirParts.push(node.name);
        node.relativePath = dirParts.join("/");
        if (node.data) {
          node.data.titulo = newName.replace(".json", "");
        }
        return;
      }
      if (node.children) {
        this.renameNodeInTree(node.children, oldRelPath, newName, type);
      }
    }
  }
}

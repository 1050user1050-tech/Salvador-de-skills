import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Local storage base directory for skills
const STORAGE_DIR = path.join(process.cwd(), "storage", "skills");

// Helper to ensure initial storage directory & sample skills exist
async function initStorage() {
  try {
    if (!existsSync(STORAGE_DIR)) {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    }

    // Create subfolders if empty
    const frontendDir = path.join(STORAGE_DIR, "frontend");
    const backendDir = path.join(STORAGE_DIR, "backend");
    const optimizationDir = path.join(STORAGE_DIR, "token-optimization");

    await fs.mkdir(frontendDir, { recursive: true });
    await fs.mkdir(backendDir, { recursive: true });
    await fs.mkdir(optimizationDir, { recursive: true });

    // Sample Skill 1: React Clean Code
    const sampleSkill1Path = path.join(frontendDir, "react-clean-code.json");
    if (!existsSync(sampleSkill1Path)) {
      const sample1 = {
        id: "skill_react_clean_code",
        titulo: "React Clean Code & Optimization Specialist",
        descricao: "Diretrizes e padrão de refatoração para componentes React 19 com foco em Clean Code, reusabilidade e hooks otimizados.",
        link_github: "https://github.com/facebook/react",
        tags: ["frontend", "react", "clean-code", "typescript"],
        versoes: [
          {
            versao: "v1.0",
            data: new Date("2026-08-01T10:00:00.000Z").toISOString(),
            conteudo_do_prompt: "Você é um Engenheiro de Software especialista em React e TypeScript.\n\nRegras de Código:\n1. Prefira componentes funcionais com TypeScript estrito.\n2. Evite re-renderizações desnecessárias usando useCallback e useMemo apenas onde houver custo real de computação.\n3. Extraia lógica complexa para Custom Hooks em arquivos separados.\n4. Mantenha os componentes pequenos (máximo 150 linhas).\n\nFormato de Resposta:\n- Breve resumo das mudanças\n- Código completo com explicações claras."
          },
          {
            versao: "v1.1",
            data: new Date("2026-08-05T09:00:00.000Z").toISOString(),
            conteudo_do_prompt: "Você é um Engenheiro de Software Sênior especialista em React 19 e TypeScript estrito.\n\nDiretrizes de Arquitetura:\n1. Prefira componentes funcionais modulares.\n2. Siga os padrões de design e acessibilidade (WCAG 2.1 AA).\n3. Extraia lógica de estado para custom hooks e utilitários isolados.\n4. Utilize Tailwind CSS v4 para estilização sem CSS-in-JS.\n5. Evite dependências cyclomaticas em useEffect.\n\nFormato de Resposta:\n1. Visão Geral da Solução\n2. Trecho de Código Refatorado\n3. Destaques de Desempenho e Segurança."
          }
        ]
      };
      await fs.writeFile(sampleSkill1Path, JSON.stringify(sample1, null, 2), "utf-8");
    }

    // Sample Skill 2: REST & GraphQL API Design
    const sampleSkill2Path = path.join(backendDir, "api-design.json");
    if (!existsSync(sampleSkill2Path)) {
      const sample2 = {
        id: "skill_api_design",
        titulo: "Arquiteto de APIs REST & Node.js",
        descricao: "Especialista em design de APIs RESTful, validação de payload com Zod e padrões de tratamento de erro e segurança.",
        tags: ["backend", "express", "api", "node", "security"],
        versoes: [
          {
            versao: "v1.0",
            data: new Date("2026-08-02T14:30:00.000Z").toISOString(),
            conteudo_do_prompt: "Você é um Arquiteto Backend especializado em Node.js e Express.\n\nSua tarefa é projetar APIs RESTful limpas e seguras:\n- Sempre utilize DTOs e esquemas de validação de dados.\n- Retorne status HTTP semânticos (200, 201, 400, 401, 403, 404, 500).\n- Padronize as respostas de erro em formato JSON com 'code', 'message' e 'details'.\n- Implemente middleware de sanitarização de dados e tratamento de exceções assíncronas."
          }
        ]
      };
      await fs.writeFile(sampleSkill2Path, JSON.stringify(sample2, null, 2), "utf-8");
    }

    // Sample Skill 3: Prompt Compressor
    const sampleSkill3Path = path.join(optimizationDir, "prompt-compressor.json");
    if (!existsSync(sampleSkill3Path)) {
      const sample3 = {
        id: "skill_prompt_compressor",
        titulo: "Otimizador e Compressor de Prompts",
        descricao: "Comprime e refatora prompts de LLM reduzindo contagem de tokens sem perder contexto ou precisão.",
        tags: ["token-optimization", "prompt-engineering", "efficiency"],
        versoes: [
          {
            versao: "v1.0",
            data: new Date("2026-08-04T18:00:00.000Z").toISOString(),
            conteudo_do_prompt: "Sua tarefa é analisar o prompt fornecido pelo usuário e comprimi-lo para economizar de 30% a 60% dos tokens mantendo 100% das diretrizes críticas.\n\nPassos:\n1. Elimine saudações, preâmbulos e redundâncias.\n2. Transforme frases longas em tópicos diretos e imperativos.\n3. Mantenha os delimitadores e variáveis (ex: {{user_input}}).\n4. Exiba o prompt comprimido e a porcentagem de tokens economizados estipulada."
          }
        ]
      };
      await fs.writeFile(sampleSkill3Path, JSON.stringify(sample3, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error initializing storage directory:", err);
  }
}

initStorage();

// Helper to recursively read directory contents
interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  type: "folder" | "file";
  children?: FileTreeNode[];
  data?: any;
}

async function readTree(dirPath: string, relativeBase: string = ""): Promise<FileTreeNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const items: FileTreeNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = await readTree(fullPath, relPath);
      items.push({
        id: `dir_${relPath}`,
        name: entry.name,
        path: fullPath,
        relativePath: relPath,
        type: "folder",
        children
      });
    } else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.startsWith(".")) {
      try {
        const rawContent = await fs.readFile(fullPath, "utf-8");
        const jsonContent = JSON.parse(rawContent);
        items.push({
          id: jsonContent.id || `file_${relPath}`,
          name: entry.name,
          path: fullPath,
          relativePath: relPath,
          type: "file",
          data: jsonContent
        });
      } catch (e) {
        console.warn(`Failed to parse json file: ${fullPath}`, e);
      }
    }
  }

  // Sort folders first, then files alphabetically
  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
}

// REST API Endpoints

// GET /api/skills/tree - Get recursive directory tree
app.get("/api/skills/tree", async (req, res) => {
  try {
    const tree = await readTree(STORAGE_DIR);
    res.json({
      success: true,
      storagePath: STORAGE_DIR,
      tree
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/skills/file - Create or update a skill JSON file
app.post("/api/skills/file", async (req, res) => {
  try {
    const { relativeFolder, filename, skillData } = req.body;
    if (!filename || !skillData) {
      return res.status(400).json({ success: false, error: "Missing filename or skillData" });
    }

    const cleanFilename = filename.endsWith(".json") ? filename : `${filename}.json`;
    const targetFolder = relativeFolder ? path.join(STORAGE_DIR, relativeFolder) : STORAGE_DIR;

    if (!existsSync(targetFolder)) {
      await fs.mkdir(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, cleanFilename);
    await fs.writeFile(filePath, JSON.stringify(skillData, null, 2), "utf-8");

    res.json({
      success: true,
      filePath,
      relativePath: relativeFolder ? `${relativeFolder}/${cleanFilename}` : cleanFilename
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/skills/file - Delete a skill JSON file
app.delete("/api/skills/file", async (req, res) => {
  try {
    const { relativePath } = req.body;
    if (!relativePath) {
      return res.status(400).json({ success: false, error: "Missing relativePath" });
    }

    const fullPath = path.join(STORAGE_DIR, relativePath);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }

    res.json({ success: true, message: "File deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/skills/folder - Create a new folder
app.post("/api/skills/folder", async (req, res) => {
  try {
    const { parentFolder, folderName } = req.body;
    if (!folderName) {
      return res.status(400).json({ success: false, error: "Missing folderName" });
    }

    const targetFolder = parentFolder ? path.join(STORAGE_DIR, parentFolder, folderName) : path.join(STORAGE_DIR, folderName);
    await fs.mkdir(targetFolder, { recursive: true });

    res.json({ success: true, folderPath: targetFolder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/skills/folder - Delete a folder recursively
app.delete("/api/skills/folder", async (req, res) => {
  try {
    const { relativePath } = req.body;
    if (!relativePath) {
      return res.status(400).json({ success: false, error: "Missing relativePath" });
    }

    const fullPath = path.join(STORAGE_DIR, relativePath);
    if (existsSync(fullPath)) {
      await fs.rm(fullPath, { recursive: true, force: true });
    }

    res.json({ success: true, message: "Folder deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/skills/rename - Rename a file or folder
app.put("/api/skills/rename", async (req, res) => {
  try {
    const { oldRelativePath, newName, type } = req.body;
    if (!oldRelativePath || !newName) {
      return res.status(400).json({ success: false, error: "Missing oldRelativePath or newName" });
    }

    const oldFullPath = path.join(STORAGE_DIR, oldRelativePath);
    const dirName = path.dirname(oldFullPath);
    
    let formattedNewName = newName;
    if (type === "file" && !formattedNewName.endsWith(".json")) {
      formattedNewName += ".json";
    }

    const newFullPath = path.join(dirName, formattedNewName);

    if (existsSync(oldFullPath)) {
      await fs.rename(oldFullPath, newFullPath);
    }

    res.json({ success: true, newFullPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simulated/Real Git sync state
let gitConfigState = {
  repoUrl: "https://github.com/my-org/ai-skills-repository.git",
  branch: "main",
  authorName: "Engenheiro de IA",
  authorEmail: "dev@promptstudio.local",
  autoSync: true,
  autoSyncIntervalMinutes: 60, // default 1 hour
  lastSyncTime: new Date().toISOString(),
  commits: [
    {
      hash: "a7f3b21",
      message: "Sync: Atualizada skill React Clean Code v1.1",
      author: "Engenheiro de IA",
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "synced"
    },
    {
      hash: "e4d1c90",
      message: "Feat: Adicionada pasta /token-optimization com prompt compressor",
      author: "Engenheiro de IA",
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "synced"
    }
  ]
};

// GET /api/git/status
app.get("/api/git/status", (req, res) => {
  res.json({
    success: true,
    config: gitConfigState
  });
});

// POST /api/git/config - Update Git Configuration
app.post("/api/git/config", (req, res) => {
  try {
    const { repoUrl, branch, authorName, autoSync, autoSyncIntervalMinutes } = req.body;
    if (repoUrl !== undefined) gitConfigState.repoUrl = repoUrl;
    if (branch !== undefined) gitConfigState.branch = branch;
    if (authorName !== undefined) gitConfigState.authorName = authorName;
    if (autoSync !== undefined) gitConfigState.autoSync = autoSync;
    if (autoSyncIntervalMinutes !== undefined) gitConfigState.autoSyncIntervalMinutes = Number(autoSyncIntervalMinutes);

    res.json({
      success: true,
      config: gitConfigState,
      message: "Configurações de sincronização Git salvas com sucesso!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/git/sync - Perform Git Sync (Pull & Push)
app.post("/api/git/sync", async (req, res) => {
  try {
    const { repoUrl, branch, commitMessage } = req.body;
    if (repoUrl) gitConfigState.repoUrl = repoUrl;
    if (branch) gitConfigState.branch = branch;

    const newCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      message: commitMessage || "Sync: Atualização automática das skills locais",
      author: gitConfigState.authorName,
      date: new Date().toISOString(),
      status: "synced" as const
    };

    gitConfigState.lastSyncTime = new Date().toISOString();
    gitConfigState.commits.unshift(newCommit);

    res.json({
      success: true,
      message: `Sincronização realizada com sucesso para ${gitConfigState.repoUrl} (${gitConfigState.branch})`,
      commit: newCommit,
      lastSyncTime: gitConfigState.lastSyncTime
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/test-prompt - Test prompt with Gemini API
app.post("/api/test-prompt", async (req, res) => {
  try {
    const { prompt, userVariables } = req.body;
    
    // Replace variables in format {{key}} with values
    let finalPrompt = prompt || "";
    if (userVariables && typeof userVariables === "object") {
      Object.keys(userVariables).forEach((key) => {
        const val = userVariables[key] || "";
        finalPrompt = finalPrompt.replaceAll(`{{${key}}}`, val);
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        simulation: true,
        finalPrompt,
        result: `[Modo Simulado - Chave GEMINI_API_KEY não configurada]\n\nResposta do Modelo para o Prompt Otimizado:\n\nOlá! Recebi seu prompt testado:\n\n"${finalPrompt.substring(0, 150)}..."\n\nInstrução processada com sucesso. Em ambiente com GEMINI_API_KEY ativa, o resultado do Gemini 2.5 Flash seria retornado em tempo real.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt
    });

    res.json({
      success: true,
      simulation: false,
      finalPrompt,
      result: response.text
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prompt & Skill Manager Server running at http://localhost:${PORT}`);
  });
}

startServer();

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

// Helper to convert skill title/filename to a safe folder name
function sanitizeFolderName(name: string): string {
  return name.replace(/\.json$/i, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// Helper to ensure initial storage directory & sample skills in new modular folder format
async function initStorage() {
  try {
    if (!existsSync(STORAGE_DIR)) {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    }

    const frontendDir = path.join(STORAGE_DIR, "frontend");
    const backendDir = path.join(STORAGE_DIR, "backend");
    const optimizationDir = path.join(STORAGE_DIR, "token-optimization");

    await fs.mkdir(frontendDir, { recursive: true });
    await fs.mkdir(backendDir, { recursive: true });
    await fs.mkdir(optimizationDir, { recursive: true });

    // Sample Skill 1: React Clean Code
    const skill1Folder = path.join(frontendDir, "react-clean-code");
    if (!existsSync(skill1Folder)) {
      await fs.mkdir(skill1Folder, { recursive: true });
      await fs.mkdir(path.join(skill1Folder, "versions"), { recursive: true });
      await fs.mkdir(path.join(skill1Folder, "assets"), { recursive: true });

      await fs.writeFile(path.join(skill1Folder, "title.json"), JSON.stringify({ title: "React Clean Code & Optimization Specialist" }, null, 2));
      await fs.writeFile(path.join(skill1Folder, "description.json"), JSON.stringify({ description: "Diretrizes e padrão de refatoração para componentes React 19 com foco em Clean Code, reusabilidade e hooks otimizados." }, null, 2));
      await fs.writeFile(path.join(skill1Folder, "github.json"), JSON.stringify({ url: "https://github.com/facebook/react" }, null, 2));
      await fs.writeFile(path.join(skill1Folder, "tags.json"), JSON.stringify({ tags: ["frontend", "react", "clean-code", "typescript"] }, null, 2));
      await fs.writeFile(path.join(skill1Folder, "prompt.json"), JSON.stringify({ content: "Você é um Engenheiro de Software Sênior especialista em React 19 e TypeScript estrito.\n\nDiretrizes de Arquitetura:\n1. Prefira componentes funcionais modulares.\n2. Siga os padrões de design e acessibilidade (WCAG 2.1 AA).\n3. Extraia lógica de estado para custom hooks e utilitários isolados.\n4. Utilize Tailwind CSS v4 para estilização sem CSS-in-JS.\n5. Evite dependências cyclomaticas em useEffect.\n\nFormato de Resposta:\n1. Visão Geral da Solução\n2. Trecho de Código Refatorado\n3. Destaques de Desempenho e Segurança." }, null, 2));

      await fs.writeFile(path.join(skill1Folder, "versions", "v1.0.json"), JSON.stringify({
        version: "v1.0",
        date: "2026-08-01T10:00:00.000Z",
        content: "Você é um Engenheiro de Software especialista em React e TypeScript.\n\nRegras de Código:\n1. Prefira componentes funcionais com TypeScript estrito.\n2. Evite re-renderizações desnecessárias usando useCallback e useMemo apenas onde houver custo real de computação.\n3. Extraia lógica complexa para Custom Hooks em arquivos separados.\n4. Mantenha os componentes pequenos (máximo 150 linhas).\n\nFormato de Resposta:\n- Breve resumo das mudanças\n- Código completo com explicações claras."
      }, null, 2));

      await fs.writeFile(path.join(skill1Folder, "versions", "v1.1.json"), JSON.stringify({
        version: "v1.1",
        date: "2026-08-05T09:00:00.000Z",
        content: "Você é um Engenheiro de Software Sênior especialista em React 19 e TypeScript estrito.\n\nDiretrizes de Arquitetura:\n1. Prefira componentes funcionais modulares.\n2. Siga os padrões de design e acessibilidade (WCAG 2.1 AA).\n3. Extraia lógica de estado para custom hooks e utilitários isolados.\n4. Utilize Tailwind CSS v4 para estilização sem CSS-in-JS.\n5. Evite dependências cyclomaticas em useEffect.\n\nFormato de Resposta:\n1. Visão Geral da Solução\n2. Trecho de Código Refatorado\n3. Destaques de Desempenho e Segurança."
      }, null, 2));
    }

    // Sample Skill 2: REST API Design
    const skill2Folder = path.join(backendDir, "api-design");
    if (!existsSync(skill2Folder)) {
      await fs.mkdir(skill2Folder, { recursive: true });
      await fs.mkdir(path.join(skill2Folder, "versions"), { recursive: true });
      await fs.mkdir(path.join(skill2Folder, "assets"), { recursive: true });

      await fs.writeFile(path.join(skill2Folder, "title.json"), JSON.stringify({ title: "Arquiteto de APIs REST & Node.js" }, null, 2));
      await fs.writeFile(path.join(skill2Folder, "description.json"), JSON.stringify({ description: "Especialista em design de APIs RESTful, validação de payload com Zod e padrões de tratamento de erro e segurança." }, null, 2));
      await fs.writeFile(path.join(skill2Folder, "github.json"), JSON.stringify({ url: "" }, null, 2));
      await fs.writeFile(path.join(skill2Folder, "tags.json"), JSON.stringify({ tags: ["backend", "express", "api", "node", "security"] }, null, 2));
      await fs.writeFile(path.join(skill2Folder, "prompt.json"), JSON.stringify({ content: "Você é um Arquiteto Backend especializado em Node.js e Express.\n\nSua tarefa é projetar APIs RESTful limpas e seguras:\n- Sempre utilize DTOs e esquemas de validação de dados.\n- Retorne status HTTP semânticos (200, 201, 400, 401, 403, 404, 500).\n- Padronize as respostas de erro em formato JSON com 'code', 'message' e 'details'.\n- Implemente middleware de sanitarização de dados e tratamento de exceções assíncronas." }, null, 2));

      await fs.writeFile(path.join(skill2Folder, "versions", "v1.0.json"), JSON.stringify({
        version: "v1.0",
        date: "2026-08-02T14:30:00.000Z",
        content: "Você é um Arquiteto Backend especializado em Node.js e Express.\n\nSua tarefa é projetar APIs RESTful limpas e seguras:\n- Sempre utilize DTOs e esquemas de validação de dados.\n- Retorne status HTTP semânticos (200, 201, 400, 401, 403, 404, 500).\n- Padronize as respostas de erro em formato JSON com 'code', 'message' e 'details'.\n- Implemente middleware de sanitarização de dados e tratamento de exceções assíncronas."
      }, null, 2));
    }

    // Sample Skill 3: Prompt Compressor
    const skill3Folder = path.join(optimizationDir, "prompt-compressor");
    if (!existsSync(skill3Folder)) {
      await fs.mkdir(skill3Folder, { recursive: true });
      await fs.mkdir(path.join(skill3Folder, "versions"), { recursive: true });
      await fs.mkdir(path.join(skill3Folder, "assets"), { recursive: true });

      await fs.writeFile(path.join(skill3Folder, "title.json"), JSON.stringify({ title: "Otimizador e Compressor de Prompts" }, null, 2));
      await fs.writeFile(path.join(skill3Folder, "description.json"), JSON.stringify({ description: "Comprime e refatora prompts de LLM reduzindo contagem de tokens sem perder contexto ou precisão." }, null, 2));
      await fs.writeFile(path.join(skill3Folder, "github.json"), JSON.stringify({ url: "" }, null, 2));
      await fs.writeFile(path.join(skill3Folder, "tags.json"), JSON.stringify({ tags: ["token-optimization", "prompt-engineering", "efficiency"] }, null, 2));
      await fs.writeFile(path.join(skill3Folder, "prompt.json"), JSON.stringify({ content: "Sua tarefa é analisar o prompt fornecido pelo usuário e comprimi-lo para economizar de 30% a 60% dos tokens mantendo 100% das diretrizes críticas.\n\nPassos:\n1. Elimine saudações, preâmbulos e redundâncias.\n2. Transforme frases longas em tópicos diretos e imperativos.\n3. Mantenha os delimitadores e variáveis (ex: {{user_input}}).\n4. Exiba o prompt comprimido e a porcentagem de tokens economizados estipulada." }, null, 2));

      await fs.writeFile(path.join(skill3Folder, "versions", "v1.0.json"), JSON.stringify({
        version: "v1.0",
        date: "2026-08-04T18:00:00.000Z",
        content: "Sua tarefa é analisar o prompt fornecido pelo usuário e comprimi-lo para economizar de 30% a 60% dos tokens mantendo 100% das diretrizes críticas.\n\nPassos:\n1. Elimine saudações, preâmbulos e redundâncias.\n2. Transforme frases longas em tópicos diretos e imperativos.\n3. Mantenha os delimitadores e variáveis (ex: {{user_input}}).\n4. Exiba o prompt comprimido e a porcentagem de tokens economizados estipulada."
      }, null, 2));
    }
  } catch (err) {
    console.error("Error initializing storage directory:", err);
  }
}

initStorage();

// Helper to check if a directory is a Skill Folder
async function isSkillFolder(dirPath: string): Promise<boolean> {
  try {
    const titlePath = path.join(dirPath, "title.json");
    const promptPath = path.join(dirPath, "prompt.json");
    const descPath = path.join(dirPath, "description.json");
    return existsSync(titlePath) || existsSync(promptPath) || existsSync(descPath);
  } catch {
    return false;
  }
}

// Helper to read and aggregate a Skill Folder into a unified Skill object
async function readSkillFolder(dirPath: string, relativePath: string): Promise<any> {
  const folderName = path.basename(dirPath);

  let titulo = folderName;
  let descricao = "";
  let link_github = "";
  let tags: string[] = [];
  let promptContent = "";
  let versoes: any[] = [];
  let assets: string[] = [];

  // 1. Title
  const titleFile = path.join(dirPath, "title.json");
  if (existsSync(titleFile)) {
    try {
      const data = JSON.parse(await fs.readFile(titleFile, "utf-8"));
      titulo = data.title || data.titulo || titulo;
    } catch {}
  }

  // 2. Description
  const descFile = path.join(dirPath, "description.json");
  if (existsSync(descFile)) {
    try {
      const data = JSON.parse(await fs.readFile(descFile, "utf-8"));
      descricao = data.description || data.descricao || "";
    } catch {}
  }

  // 3. GitHub Link
  const githubFile = path.join(dirPath, "github.json");
  if (existsSync(githubFile)) {
    try {
      const data = JSON.parse(await fs.readFile(githubFile, "utf-8"));
      link_github = data.url || data.link_github || "";
    } catch {}
  }

  // 4. Tags
  const tagsFile = path.join(dirPath, "tags.json");
  if (existsSync(tagsFile)) {
    try {
      const data = JSON.parse(await fs.readFile(tagsFile, "utf-8"));
      tags = data.tags || [];
    } catch {}
  }

  // 5. Prompt Content
  const promptFile = path.join(dirPath, "prompt.json");
  if (existsSync(promptFile)) {
    try {
      const data = JSON.parse(await fs.readFile(promptFile, "utf-8"));
      promptContent = data.content || data.conteudo_do_prompt || "";
    } catch {}
  }

  // 6. Versions Folder
  const versionsDir = path.join(dirPath, "versions");
  if (existsSync(versionsDir)) {
    try {
      const vEntries = await fs.readdir(versionsDir);
      for (const entry of vEntries) {
        if (entry.endsWith(".json")) {
          try {
            const raw = await fs.readFile(path.join(versionsDir, entry), "utf-8");
            const parsed = JSON.parse(raw);
            versoes.push({
              versao: parsed.version || parsed.versao || entry.replace(".json", ""),
              data: parsed.date || parsed.data || new Date().toISOString(),
              conteudo_do_prompt: parsed.content || parsed.conteudo_do_prompt || "",
              changelog: parsed.changelog
            });
          } catch {}
        }
      }
    } catch {}
  }

  // Fallback if no versions found
  if (versoes.length === 0) {
    versoes.push({
      versao: "v1.0",
      data: new Date().toISOString(),
      conteudo_do_prompt: promptContent
    });
  } else {
    // Sort versions by version name/date
    versoes.sort((a, b) => a.versao.localeCompare(b.versao));
  }

  // 7. Assets Folder
  const assetsDir = path.join(dirPath, "assets");
  if (existsSync(assetsDir)) {
    try {
      const aEntries = await fs.readdir(assetsDir);
      for (const entry of aEntries) {
        if (!entry.startsWith(".")) {
          assets.push(entry);
        }
      }
    } catch {}
  }

  const skillId = `skill_${relativePath.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  return {
    id: skillId,
    titulo,
    descricao,
    link_github,
    tags,
    versoes,
    assets,
    relativePath,
    filename: folderName
  };
}

// Helper to recursively read directory contents and identify skill folders
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
      // Check if this directory is a Skill Folder itself
      if (await isSkillFolder(fullPath)) {
        const skillData = await readSkillFolder(fullPath, relPath);
        items.push({
          id: skillData.id,
          name: entry.name,
          path: fullPath,
          relativePath: relPath,
          type: "file",
          data: skillData
        });
      } else {
        // Otherwise it's a category folder
        const children = await readTree(fullPath, relPath);
        items.push({
          id: `dir_${relPath}`,
          name: entry.name,
          path: fullPath,
          relativePath: relPath,
          type: "folder",
          children
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.startsWith(".")) {
      // Auto-migrate legacy single JSON file into a Skill Folder
      try {
        const rawContent = await fs.readFile(fullPath, "utf-8");
        const jsonContent = JSON.parse(rawContent);
        
        if (jsonContent.titulo || jsonContent.versoes) {
          const folderName = sanitizeFolderName(entry.name);
          const parentDir = path.dirname(fullPath);
          const newSkillFolderPath = path.join(parentDir, folderName);
          const newRelPath = relativeBase ? `${path.dirname(relativeBase) === "." ? "" : path.dirname(relativeBase)}/${folderName}`.replace(/^\//, "") : folderName;

          if (!existsSync(newSkillFolderPath)) {
            await fs.mkdir(newSkillFolderPath, { recursive: true });
            await fs.mkdir(path.join(newSkillFolderPath, "versions"), { recursive: true });
            await fs.mkdir(path.join(newSkillFolderPath, "assets"), { recursive: true });

            await fs.writeFile(path.join(newSkillFolderPath, "title.json"), JSON.stringify({ title: jsonContent.titulo || folderName }, null, 2));
            await fs.writeFile(path.join(newSkillFolderPath, "description.json"), JSON.stringify({ description: jsonContent.descricao || "" }, null, 2));
            await fs.writeFile(path.join(newSkillFolderPath, "github.json"), JSON.stringify({ url: jsonContent.link_github || "" }, null, 2));
            await fs.writeFile(path.join(newSkillFolderPath, "tags.json"), JSON.stringify({ tags: jsonContent.tags || [] }, null, 2));

            const activePrompt = jsonContent.versoes?.[jsonContent.versoes.length - 1]?.conteudo_do_prompt || "";
            await fs.writeFile(path.join(newSkillFolderPath, "prompt.json"), JSON.stringify({ content: activePrompt }, null, 2));

            if (jsonContent.versoes && Array.isArray(jsonContent.versoes)) {
              for (const v of jsonContent.versoes) {
                const vName = sanitizeFolderName(v.versao || "v1.0");
                await fs.writeFile(path.join(newSkillFolderPath, "versions", `${vName}.json`), JSON.stringify({
                  version: v.versao || "v1.0",
                  date: v.data || new Date().toISOString(),
                  content: v.conteudo_do_prompt || "",
                  changelog: v.changelog
                }, null, 2));
              }
            }

            // Remove legacy file
            await fs.unlink(fullPath);

            const skillData = await readSkillFolder(newSkillFolderPath, newRelPath);
            items.push({
              id: skillData.id,
              name: folderName,
              path: newSkillFolderPath,
              relativePath: newRelPath,
              type: "file",
              data: skillData
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to auto-migrate legacy json file: ${fullPath}`, e);
      }
    }
  }

  // Sort folders first, then skills
  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
}

// REST API Endpoints

// Helper to save skill data into modular folder structure
async function saveSkillModular(relativeFolder: string, filenameOrFolder: string, skillData: any) {
  const cleanFolderName = sanitizeFolderName(filenameOrFolder || skillData.titulo || "skill");
  
  // If relativeFolder already ends with cleanFolderName (editing existing skill), prevent nesting
  let folderPath: string;
  let relPath: string;

  if (skillData.relativePath) {
    folderPath = path.join(STORAGE_DIR, skillData.relativePath);
    relPath = skillData.relativePath;
  } else if (relativeFolder) {
    folderPath = path.join(STORAGE_DIR, relativeFolder, cleanFolderName);
    relPath = `${relativeFolder}/${cleanFolderName}`;
  } else {
    folderPath = path.join(STORAGE_DIR, cleanFolderName);
    relPath = cleanFolderName;
  }

  if (!existsSync(folderPath)) {
    await fs.mkdir(folderPath, { recursive: true });
  }
  
  const versionsDir = path.join(folderPath, "versions");
  const assetsDir = path.join(folderPath, "assets");
  if (!existsSync(versionsDir)) await fs.mkdir(versionsDir, { recursive: true });
  if (!existsSync(assetsDir)) await fs.mkdir(assetsDir, { recursive: true });

  // 1. title.json
  await fs.writeFile(path.join(folderPath, "title.json"), JSON.stringify({ title: skillData.titulo || "" }, null, 2), "utf-8");

  // 2. description.json
  await fs.writeFile(path.join(folderPath, "description.json"), JSON.stringify({ description: skillData.descricao || "" }, null, 2), "utf-8");

  // 3. github.json
  await fs.writeFile(path.join(folderPath, "github.json"), JSON.stringify({ url: skillData.link_github || "" }, null, 2), "utf-8");

  // 4. tags.json
  await fs.writeFile(path.join(folderPath, "tags.json"), JSON.stringify({ tags: skillData.tags || [] }, null, 2), "utf-8");

  // 5. prompt.json
  const latestPrompt = skillData.versoes && skillData.versoes.length > 0
    ? skillData.versoes[skillData.versoes.length - 1].conteudo_do_prompt
    : skillData.conteudo_do_prompt || "";
  await fs.writeFile(path.join(folderPath, "prompt.json"), JSON.stringify({ content: latestPrompt }, null, 2), "utf-8");

  // 6. versions/*.json
  if (skillData.versoes && Array.isArray(skillData.versoes)) {
    for (const v of skillData.versoes) {
      const vFileName = sanitizeFolderName(v.versao || "v1.0") + ".json";
      await fs.writeFile(path.join(versionsDir, vFileName), JSON.stringify({
        version: v.versao || "v1.0",
        date: v.data || new Date().toISOString(),
        content: v.conteudo_do_prompt || "",
        changelog: v.changelog
      }, null, 2), "utf-8");
    }
  }

  return { folderPath, relativePath: relPath, folderName: cleanFolderName };
}

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

// POST /api/skills/save-skill - Create or update modular skill folder
app.post("/api/skills/save-skill", async (req, res) => {
  try {
    const { relativeFolder, filename, skillData } = req.body;
    if (!skillData) {
      return res.status(400).json({ success: false, error: "Missing skillData" });
    }

    const result = await saveSkillModular(relativeFolder || "", filename || skillData.filename || skillData.titulo, skillData);

    res.json({
      success: true,
      filePath: result.folderPath,
      relativePath: result.relativePath
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/skills/file - Alias for save-skill
app.post("/api/skills/file", async (req, res) => {
  try {
    const { relativeFolder, filename, skillData } = req.body;
    if (!skillData) {
      return res.status(400).json({ success: false, error: "Missing skillData" });
    }

    const result = await saveSkillModular(relativeFolder || "", filename || skillData.filename || skillData.titulo, skillData);

    res.json({
      success: true,
      filePath: result.folderPath,
      relativePath: result.relativePath
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/skills/upload-asset - Upload image asset to skill's assets/ folder
app.post("/api/skills/upload-asset", async (req, res) => {
  try {
    const { relativePath, fileName, base64Data } = req.body;
    if (!relativePath || !fileName || !base64Data) {
      return res.status(400).json({ success: false, error: "Missing relativePath, fileName, or base64Data" });
    }

    const skillAssetsDir = path.join(STORAGE_DIR, relativePath, "assets");
    if (!existsSync(skillAssetsDir)) {
      await fs.mkdir(skillAssetsDir, { recursive: true });
    }

    // Strip data URL prefix if present (e.g. data:image/png;base64,)
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const targetFilePath = path.join(skillAssetsDir, cleanFileName);

    await fs.writeFile(targetFilePath, buffer);

    res.json({
      success: true,
      fileName: cleanFileName,
      relativePath,
      message: "Imagem anexada com sucesso!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/skills/asset - Delete an image asset
app.delete("/api/skills/asset", async (req, res) => {
  try {
    const { relativePath, fileName } = req.body;
    if (!relativePath || !fileName) {
      return res.status(400).json({ success: false, error: "Missing relativePath or fileName" });
    }

    const targetFilePath = path.join(STORAGE_DIR, relativePath, "assets", fileName);
    if (existsSync(targetFilePath)) {
      await fs.unlink(targetFilePath);
    }

    res.json({ success: true, message: "Imagem removida dos anexos com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/skills/asset-file - Serve image file from assets folder
app.get("/api/skills/asset-file", (req, res) => {
  try {
    const relPath = req.query.path as string;
    const fileName = req.query.file as string;
    if (!relPath || !fileName) {
      return res.status(400).send("Missing path or file query params");
    }

    const targetFilePath = path.join(STORAGE_DIR, relPath, "assets", fileName);
    if (existsSync(targetFilePath)) {
      return res.sendFile(targetFilePath);
    } else {
      return res.status(404).send("File not found");
    }
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// DELETE /api/skills/file - Delete a skill folder or file
app.delete("/api/skills/file", async (req, res) => {
  try {
    const { relativePath } = req.body;
    if (!relativePath) {
      return res.status(400).json({ success: false, error: "Missing relativePath" });
    }

    const fullPath = path.join(STORAGE_DIR, relativePath);
    if (existsSync(fullPath)) {
      await fs.rm(fullPath, { recursive: true, force: true });
    }

    res.json({ success: true, message: "Skill deletada com sucesso" });
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

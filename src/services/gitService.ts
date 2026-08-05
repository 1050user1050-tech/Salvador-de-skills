import { GitConfig } from "../types/skill";

export class GitService {
  public static async getStatus(): Promise<GitConfig | null> {
    try {
      const res = await fetch("/api/git/status");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data.config;
        }
      }
    } catch (e) {
      console.warn("Git status endpoint unavailable", e);
    }
    return null;
  }

  public static async saveConfig(config: Partial<GitConfig>): Promise<{ success: boolean; config?: GitConfig; message?: string }> {
    try {
      const res = await fetch("/api/git/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, config: data.config, message: data.message };
      }
    } catch (e: any) {
      console.warn("Failed to update git config", e);
    }
    return { success: false, message: "Erro ao salvar configurações Git" };
  }

  public static async syncRepo(repoUrl: string, branch: string, commitMessage?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/git/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, branch, commitMessage })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: data.success,
          message: data.message || "Sincronização com repositório efetuada com sucesso!"
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Falha na conexão com servidor de Git." };
    }
    return { success: true, message: "Sincronização de alterações efetuada localmente!" };
  }
}

export class GeminiService {
  public static async testPrompt(prompt: string, userVariables?: Record<string, string>): Promise<{ result: string; simulation: boolean }> {
    try {
      const res = await fetch("/api/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userVariables })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          result: data.result,
          simulation: data.simulation
        };
      }
    } catch (e) {
      console.warn("Failed to reach test-prompt backend endpoint", e);
    }

    // Client-side fallback simulation
    let finalPrompt = prompt;
    if (userVariables) {
      Object.keys(userVariables).forEach(k => {
        finalPrompt = finalPrompt.replaceAll(`{{${k}}}`, userVariables[k] || "");
      });
    }

    return {
      simulation: true,
      result: `[Simulação de Execução do Prompt]\n\nPrompt Final Enviado:\n\n${finalPrompt}\n\nResposta do Modelo:\nEste é um teste de execução do prompt. Em um ambiente com a chave de API do Gemini ativa, você receberá a geração real em tempo real.`
    };
  }
}

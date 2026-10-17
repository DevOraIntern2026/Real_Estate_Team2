export type LLMCaller = (messages: Array<{ role: string; content: string }>) => Promise<string>;

export interface LLMConfig {
  provider: "openai" | "gemini";
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export function createLLMCaller(config: LLMConfig): LLMCaller {
  return async (messages) => {
    if (config.provider === "openai") {
      const base = config.baseUrl || "https://api.openai.com/v1";
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({ model: config.model, messages, temperature: 0.2 }),
      });
      if (!res.ok) throw new Error(`LLM error: ${res.status} ${await res.text()}`);
      const data: any = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Invalid LLM response");
      return content;
    }
    // Gemini via generativelanguage endpoint (OpenAI-compatible path).
    const base = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta/openai";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, messages, temperature: 0.2 }),
    });
    if (!res.ok) throw new Error(`LLM error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Invalid LLM response");
    return content;
  };
}

export function llmConfigFromEnv(env: Record<string, string | undefined> = process.env): LLMConfig | null {
  const apiKey = env.AI_API_KEY || env.OPENAI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const provider = (env.AI_PROVIDER || "openai").toLowerCase() === "gemini" ? "gemini" : "openai";
  const model = env.AI_MODEL || (provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");
  return { provider, apiKey, model, baseUrl: env.AI_BASE_URL };
}
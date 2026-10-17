import { AI_MODEL, AI_TIMEOUT_MS, GEMINI_API_KEY } from "../../../common/config/config";
import { AIServiceUnavailableException } from "../../../common/exceptions";
import { IAIExtractionResult } from "../ai.interface";
import { AI_SYSTEM_PROMPT } from "../ai.prompt";
import { aiExtractionResponseSchema } from "../ai.validation";
import { IAIProvider } from "./ai-provider.interface";

export class GeminiProvider implements IAIProvider {
  public readonly name = "gemini";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(apiKey?: string, model?: string, timeoutMs?: number) {
    this.apiKey = apiKey || GEMINI_API_KEY;
    this.model = model || AI_MODEL;
    this.timeoutMs = timeoutMs || AI_TIMEOUT_MS;
  }

  async extractPreferences(message: string): Promise<IAIExtractionResult> {
    if (!this.apiKey) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "Gemini API key is not configured" },
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model,
    )}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: AI_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: any) {
      if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
        throw new AIServiceUnavailableException(
          "AI assistant is currently unavailable.",
          "AI_SERVICE_UNAVAILABLE",
          { detail: "Request to AI provider timed out" },
        );
      }
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "Network connection to AI provider failed" },
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new AIServiceUnavailableException(
          "AI assistant is currently unavailable.",
          "AI_SERVICE_UNAVAILABLE",
          { detail: "Rate limit reached from AI provider" },
        );
      }
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { status: response.status, detail: "AI provider returned non-200 status" },
      );
    }

    let rawJson: any;
    try {
      const data: any = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText || typeof rawText !== "string") {
        throw new Error("Empty content in Gemini response");
      }

      // Clean any accidental markdown code fences
      const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      rawJson = JSON.parse(cleaned);
    } catch (parseErr: any) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "Failed to parse AI output as JSON" },
      );
    }

    // Validate structured extraction using Zod schema
    const validationResult = aiExtractionResponseSchema.safeParse(rawJson);
    if (!validationResult.success) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        {
          detail: "AI output failed structural validation",
          issues: validationResult.error.issues,
        },
      );
    }

    return validationResult.data as IAIExtractionResult;
  }
}

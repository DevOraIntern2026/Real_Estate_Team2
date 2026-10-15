import {
  AI_API_KEY,
  AI_BASE_URL,
  AI_MODEL,
  AI_TIMEOUT_MS,
} from "../../../common/config/config";
import { AIServiceUnavailableException } from "../../../common/exceptions";
import { IAIExtractionResult } from "../ai.interface";
import { aiExtractionResponseSchema } from "../ai.validation";
import { IAIProvider } from "./ai-provider.interface";

export class OpenAIProvider implements IAIProvider {
  public readonly name = "openai";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(apiKey?: string, model?: string, baseUrl?: string, timeoutMs?: number) {
    this.apiKey = apiKey || AI_API_KEY;
    this.model = model || AI_MODEL;
    this.baseUrl = (baseUrl || AI_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = timeoutMs || AI_TIMEOUT_MS;
  }

  async extractPreferences(message: string): Promise<IAIExtractionResult> {
    if (!this.apiKey) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "OpenAI API key is not configured" },
      );
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant. Understand Arabic or English. Return ONLY strict JSON with this exact shape: { \"preferences\": { \"transactionType\": \"rent\" or \"sale\" or null, \"propertyType\": one of [\"apartment\",\"villa\",\"studio\",\"duplex\",\"penthouse\",\"townhouse\",\"office\",\"shop\",\"warehouse\",\"land\",\"building\"] or null, \"location\": string|null, \"minPrice\": number|null, \"maxPrice\": number|null, \"bedrooms\": number|null, \"bathrooms\": number|null, \"minArea\": number|null, \"maxArea\": number|null, \"furnished\": true/false/null, \"preferences\": {\"quietArea\": boolean|null, \"nearUniversity\": boolean|null, \"parking\": boolean|null, \"balcony\": boolean|null} }, \"needsClarification\": boolean, \"clarificationQuestion\": string|null, \"unsupportedAction\": boolean, \"actionMessage\": string|null }. All enum values (propertyType, transactionType, furnished) must be ENGLISH JSON strings from the allowed lists, not Arabic. Do not add extra keys. Return only JSON.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    }).catch((err: any) => {
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
    });

    if (!response.ok) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { status: response.status, detail: "AI provider returned non-200 status" },
      );
    }

    const data: any = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (typeof rawText !== "string") {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "Empty content in AI response" },
      );
    }

    const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    let rawJson: any;
    try {
      rawJson = JSON.parse(cleaned);
    } catch {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "Failed to parse AI output as JSON" },
      );
    }

    const validation = aiExtractionResponseSchema.safeParse(rawJson);
    if (!validation.success) {
      throw new AIServiceUnavailableException(
        "AI assistant is currently unavailable.",
        "AI_SERVICE_UNAVAILABLE",
        { detail: "AI output failed structural validation", issues: validation.error.issues },
      );
    }

    return validation.data as IAIExtractionResult;
  }
}
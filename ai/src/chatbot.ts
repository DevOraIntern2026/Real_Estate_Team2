import { buildMessages, systemPrompt } from "./prompt.js";
import { validateExtraction, parseJsonSafe } from "./validation.js";
import { mergePreferences, createConversationState } from "./context.js";
import type { LLMCaller } from "./llm.js";
import type {
  ChatbotExtraction,
  PropertyPreferences,
  PropertySearchRequest,
} from "./types.js";
import type { ConversationState } from "./context.js";

export interface ChatbotServiceOptions {
  llm?: LLMCaller | null;
}

export class AiChatbotService {
  private llm: LLMCaller | null;
  private conversations = new Map<string, ConversationState>();

  constructor(options: ChatbotServiceOptions = {}) {
    this.llm = options.llm ?? null;
  }

  getConversation(id: string): ConversationState {
    let state = this.conversations.get(id);
    if (!state) {
      state = createConversationState(id);
      this.conversations.set(id, state);
    }
    return state;
  }

  async handleMessage(
    conversationId: string,
    userMessage: string
  ): Promise<ChatbotExtraction> {
    const state = this.getConversation(conversationId);

    if (!this.llm) {
      // No external provider configured; cannot extract. Signal clearly.
      throw new Error(
        "AI provider not configured. Set AI_API_KEY (or OPENAI_API_KEY/GEMINI_API_KEY)."
      );
    }

    const messages = buildMessages(state.turns, userMessage, state.preferences);
    const raw = await this.llm(messages);
    const parsed = parseJsonSafe(raw);
    const extraction = validateExtraction(parsed);

    // Merge accumulated preferences.
    const merged = mergePreferences(state.preferences, extraction.preferences);
    state.preferences = merged;

    state.turns.push({ role: "user", content: userMessage });
    state.turns.push({
      role: "assistant",
      content:
        extraction.clarificationQuestion ??
        extraction.outOfScopeMessage ??
        "Preferences updated.",
    });

    // Return with merged preferences.
    return { ...extraction, preferences: merged };
  }

  // Prepare structured payload for backend property search.
  // TODO(BACKEND): Connect this output to the property search API.
  // Backend 3 should receive the validated PropertyPreferences and
  // return matching published, non-deleted properties.
  toSearchRequest(
    conversationId: string,
    message?: string
  ): PropertySearchRequest {
    const state = this.getConversation(conversationId);
    if (!state.preferences) throw new Error("No preferences accumulated yet");
    return {
      message,
      preferences: state.preferences,
    };
  }

  async explainRecommendations(input: {
    preferences: PropertyPreferences;
    // TODO(BACKEND): Backend 3 will provide real property results here.
    // Do not generate mock properties or call the database directly.
    properties: Array<{ id: string; title: string; [k: string]: unknown }>;
  }): Promise<string> {
    if (!this.llm) {
      throw new Error("AI provider not configured.");
    }
    const msgs = [
      {
        role: "system",
        content:
          "You are a helpful real estate assistant. Given user preferences and REAL property records supplied by the backend, explain why each recommended property matches. Do not invent data not present in the records.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ];
    return this.llm(msgs);
  }
}

export { systemPrompt };
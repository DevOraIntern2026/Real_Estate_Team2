import type { PropertyPreferences } from "./types.js";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationState {
  id: string;
  turns: ConversationTurn[];
  preferences: PropertyPreferences | null;
}

function emptyPrefs(): PropertyPreferences {
  return {
    transactionType: null,
    propertyType: null,
    location: null,
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    furnished: null,
    amenities: null,
    preferences: {},
  };
}

export function createConversationState(id: string): ConversationState {
  return { id, turns: [], preferences: emptyPrefs() };
}

// Merge new partial/extracted preferences into accumulated state (non-null wins).
export function mergePreferences(
  base: PropertyPreferences | null,
  incoming: PropertyPreferences
): PropertyPreferences {
  const result: PropertyPreferences = base ? { ...base, preferences: { ...base.preferences } } : emptyPrefs();
  for (const key of Object.keys(incoming) as Array<keyof PropertyPreferences>) {
    if (key === "preferences") {
      result.preferences = { ...result.preferences, ...(incoming.preferences || {}) };
    } else {
      const val = incoming[key];
      if (val !== null && val !== undefined) {
        (result as any)[key] = val;
      }
    }
  }
  return result;
}
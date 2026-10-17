import type { PropertyPreferences } from "./types.js";
import type { ConversationTurn } from "./context.js";

export function systemPrompt(): string {
  return [
    "You are an AI assistant for the DEVORA real estate platform.",
    "Your task is to understand a property request and extract preferences into JSON.",
    "Rules:",
    "1. Do not invent property information, prices, locations, or features.",
    "2. If a value is not provided, return null.",
    "3. Preserve explicit min/max bounds.",
    "4. Identify rent vs sale when possible.",
    "5. Extract property type, location, budget, bedrooms, bathrooms, area, furnishing, amenities, and soft preferences.",
    "6. If the request is highly ambiguous or missing vital info, set needsClarification true and provide a short clarificationQuestion.",
    "7. Return valid JSON data ONLY (no markdown, no commentary).",
    "8. You are recommendation-only. Refuse publish/buy/rent-on-behalf actions by setting outOfScope true and outOfScopeMessage explaining manual workflow.",
    "Valid propertyType: apartment, villa, studio, duplex, penthouse, townhouse, office, shop, warehouse, land, building, null.",
    "Valid transactionType: rent, sale, null.",
    "Valid furnished: unfurnished, semi_furnished, furnished, null.",
    "JSON shape:",
    '{"preferences":{"transactionType":null,"propertyType":null,"location":null,"minPrice":null,"maxPrice":null,"bedrooms":null,"bathrooms":null,"minArea":null,"maxArea":null,"furnished":null,"amenities":null,"preferences":{}},"needsClarification":false,"clarificationQuestion":null,"outOfScope":false,"outOfScopeMessage":null}',
  ].join("\n");
}

export function buildMessages(
  history: ConversationTurn[],
  userMessage: string,
  accumulated: PropertyPreferences | null
): Array<{ role: string; content: string }> {
  const msgs: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt() },
  ];
  if (accumulated) {
    msgs.push({
      role: "system",
      content: `Previously accumulated preferences (merge, do not discard): ${JSON.stringify(
        accumulated
      )}`,
    });
  }
  for (const t of history) {
    msgs.push({ role: t.role, content: t.content });
  }
  msgs.push({ role: "user", content: userMessage });
  return msgs;
}
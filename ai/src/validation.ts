import type {
  ChatbotExtraction,
  PropertyPreferences,
  PropertyType,
  TransactionType,
  Furnishing,
  SoftPreferences,
} from "./types.js";

const PROPERTY_TYPES = new Set<PropertyType>([
  "apartment",
  "villa",
  "studio",
  "duplex",
  "penthouse",
  "townhouse",
  "office",
  "shop",
  "warehouse",
  "land",
  "building",
  null,
]);

const TRANSACTION_TYPES = new Set<TransactionType>(["rent", "sale", null]);
const FURNISHINGS = new Set<Furnishing>([
  "unfurnished",
  "semi_furnished",
  "furnished",
  null,
]);

function isNumberOrNull(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && Number.isFinite(v));
}

export function validatePropertyPreferences(input: unknown): PropertyPreferences {
  if (!input || typeof input !== "object")
    throw new Error("preferences must be an object");
  const p = input as Record<string, unknown>;

  const transactionType = (p.transactionType ?? null) as TransactionType;
  if (!TRANSACTION_TYPES.has(transactionType))
    throw new Error("invalid transactionType");

  const propertyType = (p.propertyType ?? null) as PropertyType;
  if (!PROPERTY_TYPES.has(propertyType))
    throw new Error("invalid propertyType");

  const location = p.location === undefined || p.location === null ? null : String(p.location);

  const minPrice = p.minPrice ?? null;
  const maxPrice = p.maxPrice ?? null;
  const bedrooms = p.bedrooms ?? null;
  const bathrooms = p.bathrooms ?? null;
  const minArea = p.minArea ?? null;
  const maxArea = p.maxArea ?? null;
  if (!isNumberOrNull(minPrice)) throw new Error("invalid minPrice");
  if (!isNumberOrNull(maxPrice)) throw new Error("invalid maxPrice");
  if (!isNumberOrNull(bedrooms)) throw new Error("invalid bedrooms");
  if (!isNumberOrNull(bathrooms)) throw new Error("invalid bathrooms");
  if (!isNumberOrNull(minArea)) throw new Error("invalid minArea");
  if (!isNumberOrNull(maxArea)) throw new Error("invalid maxArea");

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice)
    throw new Error("minPrice cannot exceed maxPrice");
  if (minArea !== null && maxArea !== null && minArea > maxArea)
    throw new Error("minArea cannot exceed maxArea");

  const furnished = (p.furnished ?? null) as Furnishing;
  if (!FURNISHINGS.has(furnished)) throw new Error("invalid furnished");

  const amenities = p.amenities === undefined || p.amenities === null ? null : Array.isArray(p.amenities) ? (p.amenities as string[]).map(String) : null;
  if (amenities === null && p.amenities !== null && p.amenities !== undefined)
    throw new Error("invalid amenities");

  let preferences: SoftPreferences = {};
  if (p.preferences && typeof p.preferences === "object") {
    preferences = p.preferences as SoftPreferences;
  } else if (p.preferences === undefined || p.preferences === null) {
    preferences = {};
  } else {
    throw new Error("invalid preferences");
  }

  return {
    transactionType,
    propertyType,
    location,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    furnished,
    amenities,
    preferences,
  };
}

export function validateExtraction(input: unknown): ChatbotExtraction {
  if (!input || typeof input !== "object")
    throw new Error("extraction must be an object");
  const e = input as Record<string, unknown>;
  const preferences = validatePropertyPreferences(e.preferences);
  const needsClarification = Boolean(e.needsClarification);
  const clarificationQuestion =
    e.clarificationQuestion === null || e.clarificationQuestion === undefined
      ? null
      : String(e.clarificationQuestion);
  const outOfScope =
    e.outOfScope === undefined ? false : Boolean(e.outOfScope);
  const outOfScopeMessage =
    e.outOfScopeMessage === null || e.outOfScopeMessage === undefined
      ? null
      : String(e.outOfScopeMessage);
  return {
    preferences,
    needsClarification,
    clarificationQuestion,
    outOfScope,
    outOfScopeMessage,
  };
}

export function parseJsonSafe(text: string): unknown {
  // Strip markdown fences if present.
  let trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) trimmed = fence[1].trim();
  return JSON.parse(trimmed);
}
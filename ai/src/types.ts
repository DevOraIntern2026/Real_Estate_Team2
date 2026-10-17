// DEVORA AI Property Assistant - typed contracts (AI side).
// Property enums purposely mirror backend/src/common/enums/property.enums.ts
// (string labels used by the API instead of raw numeric enum values).

export type TransactionType = "rent" | "sale" | null;
export type PropertyType =
  | "apartment"
  | "villa"
  | "studio"
  | "duplex"
  | "penthouse"
  | "townhouse"
  | "office"
  | "shop"
  | "warehouse"
  | "land"
  | "building"
  | null;
export type Furnishing = "unfurnished" | "semi_furnished" | "furnished" | null;

export interface SoftPreferences {
  quietArea?: boolean | null;
  nearUniversity?: boolean | null;
  parking?: boolean | null;
  balcony?: boolean | null;
  [key: string]: boolean | null | undefined;
}

export interface PropertyPreferences {
  transactionType: TransactionType;
  propertyType: PropertyType;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  furnished: Furnishing;
  amenities: string[] | null;
  preferences: SoftPreferences;
}

export interface ChatbotExtraction {
  preferences: PropertyPreferences;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  outOfScope?: boolean;
  outOfScopeMessage?: string | null;
}

// Backend-facing integration contracts (Backend 3 fulfills).
export interface PropertySearchRequest {
  // TODO(BACKEND): Backend 3 receives this validated payload and runs the property search.
  message?: string;
  preferences: PropertyPreferences;
}

// Shape of a REAL property record returned by Backend 3 (no mock data here).
export interface PropertyResult {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency?: string;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishing?: Furnishing;
  amenities?: string[];
  facilities?: string[];
  location: {
    city?: string;
    area?: string;
    address?: string;
    country?: string;
  };
  status: "published"; // only published, non-deleted properties should be returned
  images?: string[];
}

export interface RecommendationExplanationInput {
  preferences: PropertyPreferences;
  // TODO(BACKEND): Backend 3 supplies real property records here. Do not fabricate.
  properties: PropertyResult[];
}

export interface RecommendationExplanation {
  summary: string;
  items: Array<{
    propertyId: string;
    explanation: string;
  }>;
}
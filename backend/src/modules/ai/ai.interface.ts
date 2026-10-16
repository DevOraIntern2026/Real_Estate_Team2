export interface IAISoftPreferences {
  quietArea: boolean | null;
  nearUniversity: boolean | null;
  parking: boolean | null;
  balcony: boolean | null;
}

export interface IAIExtractedPreferences {
  transactionType: "sale" | "rent" | null;
  propertyType: string | null;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  furnished: boolean | null;
  preferences: IAISoftPreferences;
}

export interface IAIExtractionResult {
  preferences: IAIExtractedPreferences;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  unsupportedAction?: boolean;
  actionMessage?: string | null;
}

export interface IAIRecommendationResult {
  success: boolean;
  preferences: IAIExtractedPreferences;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  unsupportedAction?: boolean;
  actionMessage?: string | null;
  recommendations: any[];
  meta: {
    count: number;
  };
}

export interface IRankedProperty {
  property: any;
  matchScore: number;
  scoreBreakdown?: {
    baseScore: number;
    softPreferencesScore: number;
    budgetFitScore: number;
    featuredScore: number;
  };
}

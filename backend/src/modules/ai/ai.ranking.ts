import { IAIExtractedPreferences, IRankedProperty } from "./ai.interface";

export const RANKING_WEIGHTS = {
  BASE_HARD_MATCH: 100,
  SOFT_PREFERENCE_MATCH: 15,
  BUDGET_OPTIMAL_FIT: 10,
  BUDGET_ACCEPTABLE_FIT: 5,
  FEATURED_LISTING: 5,
} as const;

/**
 * Checks whether a given keyword exists inside string arrays or text safely
 */
function hasKeyword(sources: (string[] | string | undefined | null)[], keywords: string[]): boolean {
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      for (const item of source) {
        if (typeof item === "string") {
          const lower = item.toLowerCase();
          if (keywords.some((kw) => lower.includes(kw))) return true;
        }
      }
    } else if (typeof source === "string") {
      const lower = source.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) return true;
    }
  }
  return false;
}

/**
 * Rank properties deterministically based on verified soft preferences and fit.
 * Hard constraints are already applied in the DB query; ranking only orders the results.
 */
export function rankProperties(
  properties: any[],
  preferences: IAIExtractedPreferences,
): IRankedProperty[] {
  const ranked: IRankedProperty[] = properties.map((property) => {
    let matchScore = RANKING_WEIGHTS.BASE_HARD_MATCH;
    let softPreferencesScore = 0;
    let budgetFitScore = 0;
    let featuredScore = 0;

    const propertyDoc = property.toObject ? property.toObject() : property;
    const amenities = propertyDoc.amenities || [];
    const facilities = propertyDoc.facilities || [];
    const nearby = propertyDoc.nearby || [];
    const description = propertyDoc.description || "";

    // 1. Soft preferences (parking, balcony, quietArea, nearUniversity)
    if (preferences.preferences) {
      if (preferences.preferences.parking === true) {
        if (hasKeyword([amenities, facilities, description], ["parking", "garage"])) {
          softPreferencesScore += RANKING_WEIGHTS.SOFT_PREFERENCE_MATCH;
        }
      }

      if (preferences.preferences.balcony === true) {
        if (hasKeyword([amenities, facilities, description], ["balcony", "terrace"])) {
          softPreferencesScore += RANKING_WEIGHTS.SOFT_PREFERENCE_MATCH;
        }
      }

      if (preferences.preferences.quietArea === true) {
        if (hasKeyword([nearby, description], ["quiet", "calm", "residential"])) {
          softPreferencesScore += RANKING_WEIGHTS.SOFT_PREFERENCE_MATCH;
        }
      }

      if (preferences.preferences.nearUniversity === true) {
        if (hasKeyword([nearby, description], ["university", "college", "campus"])) {
          softPreferencesScore += RANKING_WEIGHTS.SOFT_PREFERENCE_MATCH;
        }
      }
    }

    // 2. Budget fit
    if (preferences.maxPrice && typeof propertyDoc.price === "number") {
      if (propertyDoc.price <= preferences.maxPrice) {
        if (propertyDoc.price >= preferences.maxPrice * 0.7) {
          budgetFitScore += RANKING_WEIGHTS.BUDGET_OPTIMAL_FIT;
        } else {
          budgetFitScore += RANKING_WEIGHTS.BUDGET_ACCEPTABLE_FIT;
        }
      }
    }

    // 3. Featured listing
    if (propertyDoc.isFeatured) {
      featuredScore += RANKING_WEIGHTS.FEATURED_LISTING;
    }

    matchScore += softPreferencesScore + budgetFitScore + featuredScore;

    return {
      property: propertyDoc,
      matchScore,
      scoreBreakdown: {
        baseScore: RANKING_WEIGHTS.BASE_HARD_MATCH,
        softPreferencesScore,
        budgetFitScore,
        featuredScore,
      },
    };
  });

  // Sort descending by match score, ties broken by createdAt descending (newest first)
  ranked.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    const dateA = a.property.createdAt ? new Date(a.property.createdAt).getTime() : 0;
    const dateB = b.property.createdAt ? new Date(b.property.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return ranked;
}

import { AIServiceUnavailableException } from "../../../common/exceptions";
import { IAIExtractionResult } from "../ai.interface";
import { aiExtractionResponseSchema } from "../ai.validation";
import { IAIProvider } from "./ai-provider.interface";

export class MockAIProvider implements IAIProvider {
  public readonly name = "mock";
  private simulatedError: Error | null = null;
  private overrideHandler: ((message: string) => IAIExtractionResult | any) | null = null;

  public setSimulatedError(error: Error | null) {
    this.simulatedError = error;
  }

  public setOverrideHandler(handler: ((message: string) => IAIExtractionResult | any) | null) {
    this.overrideHandler = handler;
  }

  async extractPreferences(message: string): Promise<IAIExtractionResult> {
    if (this.simulatedError) {
      throw this.simulatedError;
    }

    if (this.overrideHandler) {
      const raw = this.overrideHandler(message);
      // Validate with schema to ensure contract consistency
      const validation = aiExtractionResponseSchema.safeParse(raw);
      if (!validation.success) {
        throw new AIServiceUnavailableException(
          "AI assistant is currently unavailable.",
          "AI_SERVICE_UNAVAILABLE",
          { detail: "Mock AI output failed validation", issues: validation.error.issues },
        );
      }
      return validation.data as IAIExtractionResult;
    }

    const lower = message.toLowerCase();

    // 1. Detect unsupported transactional actions
    if (
      lower.includes("publish my") ||
      lower.includes("post my") ||
      lower.includes("create listing") ||
      lower.includes("buy this property") ||
      lower.includes("pay for") ||
      lower.includes("execute payment") ||
      lower.includes("transfer money")
    ) {
      return {
        preferences: {
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
          preferences: {
            quietArea: null,
            nearUniversity: null,
            parking: null,
            balcony: null,
          },
        },
        needsClarification: false,
        clarificationQuestion: null,
        unsupportedAction: true,
        actionMessage:
          "The AI assistant cannot publish, buy, or rent properties directly. Please use our manual listings page or contact an agent to proceed.",
      };
    }

    // 2. Transaction type extraction
    let transactionType: "sale" | "rent" | null = null;
    if (lower.includes("rent") || lower.includes("rental") || lower.includes("lease")) {
      transactionType = "rent";
    } else if (lower.includes("buy") || lower.includes("sale") || lower.includes("purchase")) {
      transactionType = "sale";
    }

    // 3. Property type extraction
    let propertyType: string | null = null;
    if (lower.includes("apartment") || lower.includes("flat")) propertyType = "apartment";
    else if (lower.includes("villa")) propertyType = "villa";
    else if (lower.includes("studio")) propertyType = "studio";
    else if (lower.includes("duplex")) propertyType = "duplex";
    else if (lower.includes("penthouse")) propertyType = "penthouse";
    else if (lower.includes("townhouse")) propertyType = "townhouse";
    else if (lower.includes("office")) propertyType = "office";
    else if (lower.includes("shop")) propertyType = "shop";
    else if (lower.includes("warehouse")) propertyType = "warehouse";
    else if (lower.includes("land")) propertyType = "land";
    else if (lower.includes("building")) propertyType = "building";

    // 4. Location extraction (standard Egyptian locations)
    let location: string | null = null;
    if (lower.includes("new cairo") || lower.includes("tagamoa")) location = "New Cairo";
    else if (lower.includes("sheikh zayed") || lower.includes("zayed")) location = "Sheikh Zayed";
    else if (lower.includes("6th of october") || lower.includes("october")) location = "6th of October";
    else if (lower.includes("maadi")) location = "Maadi";
    else if (lower.includes("zamalek")) location = "Zamalek";
    else if (lower.includes("nasr city")) location = "Nasr City";
    else if (lower.includes("heliopolis")) location = "Heliopolis";
    else if (lower.includes("alexandria") || lower.includes("alex")) location = "Alexandria";
    else if (lower.includes("giza")) location = "Giza";
    else if (lower.includes("cairo")) location = "Cairo";

    // 5. Price / Budget extraction
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    // Pattern: between X and Y
    const betweenMatch = lower.match(/between\s+(\d+)\s+and\s+(\d+)/);
    if (betweenMatch && betweenMatch[1] && betweenMatch[2]) {
      minPrice = parseInt(betweenMatch[1], 10);
      maxPrice = parseInt(betweenMatch[2], 10);
    } else {
      // Pattern: under / max budget of X
      const maxMatch = lower.match(/(?:under|max(?:imum)?\s+budget\s*(?:of)?|budget\s*(?:of)?|less\s+than|up\s+to)\s*(\d+)/);
      if (maxMatch && maxMatch[1]) {
        maxPrice = parseInt(maxMatch[1], 10);
      }
      // Pattern: min / above X
      const minMatch = lower.match(/(?:above|more\s+than|min(?:imum)?\s*(?:of)?|at\s+least)\s*(\d+)/);
      if (minMatch && minMatch[1]) {
        minPrice = parseInt(minMatch[1], 10);
      }
    }

    // 6. Bedrooms extraction
    let bedrooms: number | null = null;
    const bedMatch = lower.match(/(\d+)(?:\s*|-)(?:bedroom|bed|br)/);
    if (bedMatch && bedMatch[1]) {
      bedrooms = parseInt(bedMatch[1], 10);
    }

    // 7. Bathrooms extraction
    let bathrooms: number | null = null;
    const bathMatch = lower.match(/(\d+)(?:\s*|-)(?:bathroom|bath)/);
    if (bathMatch && bathMatch[1]) {
      bathrooms = parseInt(bathMatch[1], 10);
    }

    // 8. Furnished extraction
    let furnished: boolean | null = null;
    if (lower.includes("unfurnished")) {
      furnished = false;
    } else if (lower.includes("furnished")) {
      furnished = true;
    }

    // 9. Soft preferences
    const quietArea = lower.includes("quiet") || lower.includes("calm") ? true : null;
    const parking = lower.includes("parking") || lower.includes("garage") ? true : null;
    const balcony = lower.includes("balcony") || lower.includes("terrace") ? true : null;
    const nearUniversity = lower.includes("university") || lower.includes("college") || lower.includes("campus") ? true : null;

    // 10. Clarification logic:
    // If request has ONLY propertyType or only soft preferences and lacks all location, price, and transaction type
    const hasSearchableCriteria = Boolean(
      location ||
      maxPrice ||
      minPrice ||
      (transactionType && (bedrooms || propertyType)) ||
      (bedrooms && location)
    );

    let needsClarification = false;
    let clarificationQuestion: string | null = null;

    if (!hasSearchableCriteria) {
      needsClarification = true;
      clarificationQuestion = "Are you looking to rent or buy, and which area would you prefer?";
    }

    return {
      preferences: {
        transactionType,
        propertyType,
        location,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        minArea: null,
        maxArea: null,
        furnished,
        preferences: {
          quietArea,
          nearUniversity,
          parking,
          balcony,
        },
      },
      needsClarification,
      clarificationQuestion,
      unsupportedAction: false,
      actionMessage: null,
    };
  }
}

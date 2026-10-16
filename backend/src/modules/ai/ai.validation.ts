import { z } from "zod";
import { PropertyTypeMap } from "../../common/enums";

// Allowed property types from existing system
const allowedPropertyTypes = Object.keys(PropertyTypeMap) as [string, ...string[]];

// Allowed transaction types (plus "buy" which will be normalized to "sale")
const allowedTransactionTypes = ["sale", "rent", "buy"] as const;

/**
 * Client request validation schema for POST /api/ai/recommend
 */
export const recommendPropertyValidation = {
  body: z.strictObject({
    message: z
      .string({
        error: "Message must be a string",
      })
      .trim()
      .min(1, { error: "Message cannot be empty" })
      .max(2000, { error: "Message cannot exceed 2000 characters" }),
  }),
};

/**
 * Soft preferences schema returned by AI
 */
export const aiSoftPreferencesSchema = z.strictObject({
  quietArea: z.boolean().nullable().default(null),
  nearUniversity: z.boolean().nullable().default(null),
  parking: z.boolean().nullable().default(null),
  balcony: z.boolean().nullable().default(null),
});

/**
 * Structured preferences extracted by AI
 */
export const aiExtractedPreferencesSchema = z
  .strictObject({
    transactionType: z
      .enum(allowedTransactionTypes)
      .nullable()
      .default(null)
      .transform((val) => (val === "buy" ? "sale" : val)),
    propertyType: z
      .enum(allowedPropertyTypes)
      .nullable()
      .default(null),
    location: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .default(null),
    minPrice: z
      .number()
      .nonnegative({ error: "minPrice must be non-negative" })
      .finite()
      .nullable()
      .default(null),
    maxPrice: z
      .number()
      .positive({ error: "maxPrice must be greater than zero" })
      .finite()
      .nullable()
      .default(null),
    bedrooms: z
      .number()
      .int({ error: "bedrooms must be an integer" })
      .nonnegative({ error: "bedrooms cannot be negative" })
      .nullable()
      .default(null),
    bathrooms: z
      .number()
      .int({ error: "bathrooms must be an integer" })
      .nonnegative({ error: "bathrooms cannot be negative" })
      .nullable()
      .default(null),
    minArea: z
      .number()
      .nonnegative({ error: "minArea must be non-negative" })
      .finite()
      .nullable()
      .default(null),
    maxArea: z
      .number()
      .positive({ error: "maxArea must be greater than zero" })
      .finite()
      .nullable()
      .default(null),
    furnished: z
      .boolean()
      .nullable()
      .default(null),
    preferences: aiSoftPreferencesSchema.default({
      quietArea: null,
      nearUniversity: null,
      parking: null,
      balcony: null,
    }),
  })
  .refine(
    (data) => {
      if (data.minPrice !== null && data.maxPrice !== null) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    },
  )
  .refine(
    (data) => {
      if (data.minArea !== null && data.maxArea !== null) {
        return data.minArea <= data.maxArea;
      }
      return true;
    },
    {
      message: "minArea cannot be greater than maxArea",
      path: ["minArea"],
    },
  );

/**
 * Complete LLM response validation schema
 */
export const aiExtractionResponseSchema = z.strictObject({
  preferences: aiExtractedPreferencesSchema,
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().nullable().default(null),
  unsupportedAction: z.boolean().optional().default(false),
  actionMessage: z.string().nullable().optional().default(null),
});

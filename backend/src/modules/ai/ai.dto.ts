import { z } from "zod";
import {
  recommendPropertyValidation,
  aiExtractedPreferencesSchema,
  aiExtractionResponseSchema,
} from "./ai.validation";

export type RecommendPropertyDto = z.infer<typeof recommendPropertyValidation.body>;
export type AIExtractedPreferencesDto = z.infer<typeof aiExtractedPreferencesSchema>;
export type AIExtractionResponseDto = z.infer<typeof aiExtractionResponseSchema>;

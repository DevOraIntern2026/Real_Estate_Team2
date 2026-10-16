import { IAIExtractionResult } from "../ai.interface";

export interface IAIProvider {
  readonly name: string;
  extractPreferences(message: string): Promise<IAIExtractionResult>;
}

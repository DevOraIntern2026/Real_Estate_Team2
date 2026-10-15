import { AI_PROVIDER, GEMINI_API_KEY } from "../../../common/config/config";
import { IAIProvider } from "./ai-provider.interface";
import { GeminiProvider } from "./gemini.provider";
import { MockAIProvider } from "./mock.provider";

class AIProviderFactory {
  private activeProvider: IAIProvider | null = null;
  public readonly mockProvider: MockAIProvider = new MockAIProvider();

  public getProvider(): IAIProvider {
    if (this.activeProvider) {
      return this.activeProvider;
    }

    const providerType = (AI_PROVIDER || "gemini").toLowerCase().trim();

    if (providerType === "mock" || (!GEMINI_API_KEY && process.env.NODE_ENV !== "prod")) {
      return this.mockProvider;
    }

    // Default to GeminiProvider
    this.activeProvider = new GeminiProvider();
    return this.activeProvider;
  }

  public setProvider(provider: IAIProvider | null): void {
    this.activeProvider = provider;
  }

  public useMock(): MockAIProvider {
    this.activeProvider = this.mockProvider;
    return this.mockProvider;
  }

  public reset(): void {
    this.activeProvider = null;
    this.mockProvider.setSimulatedError(null);
    this.mockProvider.setOverrideHandler(null);
  }
}

export const aiProviderFactory = new AIProviderFactory();

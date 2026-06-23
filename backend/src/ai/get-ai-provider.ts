import { AiConfigurationError } from "./errors.js";
import { createYandexAiStudioProvider } from "./providers/yandex-ai-studio-provider.js";
import type { AiProvider } from "./types.js";

let providerInstance: AiProvider | null = null;

export function getAiProvider() {
  if (providerInstance) {
    return providerInstance;
  }

  const providerName = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (
    providerName === "yandex" ||
    providerName === "yandex-ai" ||
    providerName === "yandex-ai-studio"
  ) {
    providerInstance = createYandexAiStudioProvider();
    return providerInstance;
  }

  throw new AiConfigurationError(
    'AI_PROVIDER is not configured. Supported providers: "yandex"'
  );
}
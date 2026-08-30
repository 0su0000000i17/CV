import { AiProviderError } from "../errors.js";
import type {
  AiGenerateTextParams,
  AiGenerateTextResult,
  AiProvider,
} from "../types.js";
import {
  generateSyncCompletion,
  submitCompletion,
  waitForCompletion,
} from "./yandex/completion.js";
import { getYandexConfig } from "./yandex/config.js";
import { createModelUri, selectModel } from "./yandex/model.js";
import type { YandexConfig } from "./yandex/types.js";

function toProviderError(error: unknown) {
  if (error instanceof AiProviderError) return error;
  if (error instanceof Error) return new AiProviderError(error.message.slice(0, 1000));
  return new AiProviderError("AI provider request failed");
}

async function generateAsync(
  config: YandexConfig,
  params: AiGenerateTextParams,
  model: string,
) {
  const operationId = await submitCompletion(config, params, model);
  return waitForCompletion(config, operationId);
}

export function createYandexAiStudioProvider(): AiProvider {
  return {
    async generateText(
      params: AiGenerateTextParams
    ): Promise<AiGenerateTextResult> {
      const config = getYandexConfig();
      const model = selectModel(config, params);

      try {
        // Async generation can take minutes; it is an explicit operating mode,
        // never an automatic second attempt after a failed low-latency request.
        if (config.completionMode === "sync") {
          const text = await generateSyncCompletion(config, params, model);
          return {
            text,
            provider: "yandex-sync-rest",
            model: createModelUri(config.folderId, model),
          };
        }
        const text = await generateAsync(config, params, model);

        return {
          text,
          provider: "yandex-async-rest",
          model: createModelUri(config.folderId, model),
        };
      } catch (error) {
        throw toProviderError(error);
      }
    },
  };
}

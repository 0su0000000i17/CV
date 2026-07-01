import { AiProviderError } from "../errors.js";
import type {
  AiGenerateTextParams,
  AiGenerateTextResult,
  AiProvider,
} from "../types.js";
import { submitCompletion, waitForCompletion } from "./yandex/completion.js";
import { getYandexConfig } from "./yandex/config.js";
import { createModelUri, selectModel } from "./yandex/model.js";

function toProviderError(error: unknown) {
  if (error instanceof AiProviderError) return error;
  if (error instanceof Error) return new AiProviderError(error.message.slice(0, 1000));
  return new AiProviderError("AI provider request failed");
}

export function createYandexAiStudioProvider(): AiProvider {
  return {
    async generateText(
      params: AiGenerateTextParams
    ): Promise<AiGenerateTextResult> {
      const config = getYandexConfig();
      const model = selectModel(config, params);

      try {
        const operationId = await submitCompletion(config, params, model);
        const text = await waitForCompletion(config, operationId);

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

import type { AiGenerateTextParams } from "../../types.js";
import type { YandexConfig } from "./types.js";

const PRO_MODEL_MIN_TOKENS = 3_000;

export function createModelUri(folderId: string, model: string) {
  return model.startsWith("gpt://") ? model : `gpt://${folderId}/${model}`;
}

function getDefaultModel(
  config: YandexConfig,
  params: AiGenerateTextParams
) {
  return (params.maxTokens || 0) >= PRO_MODEL_MIN_TOKENS
    ? config.proModel
    : config.liteModel;
}

export function selectModel(config: YandexConfig, params: AiGenerateTextParams) {
  return params.modelOverride?.trim() || getDefaultModel(config, params);
}

export function expectedYandexProviderName() {
  return process.env.YANDEX_AI_COMPLETION_MODE?.trim().toLowerCase() === "async"
    ? "yandex-async-rest"
    : "yandex-sync-rest";
}

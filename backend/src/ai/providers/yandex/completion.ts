import { AiProviderError } from "../../errors.js";
import type { AiGenerateTextParams } from "../../types.js";
import { createHeaders, fetchJson, sleep } from "./http.js";
import { createModelUri } from "./model.js";
import { errorDetails, extractText, parseOperation } from "./response.js";
import type { YandexConfig } from "./types.js";

export function createCompletionPayload(
  config: YandexConfig,
  params: AiGenerateTextParams,
  model: string
) {
  return {
    modelUri: createModelUri(config.folderId, model),
    completionOptions: {
      stream: false,
      temperature: params.temperature ?? 0,
      ...(params.maxTokens ? { maxTokens: String(params.maxTokens) } : {}),
      reasoningOptions: { mode: "DISABLED" },
    },
    messages: params.messages.map((message) => ({
      role: message.role,
      text: message.content,
    })),
    ...(params.jsonObject ? { jsonObject: true } : {}),
  };
}

export async function submitCompletion(
  config: YandexConfig,
  params: AiGenerateTextParams,
  model: string
) {
  const payload = createCompletionPayload(config, params, model);

  const operation = parseOperation(
    await fetchJson(
      config.asyncCompletionUrl,
      {
        method: "POST",
        headers: createHeaders(config),
        body: JSON.stringify(payload),
      },
      config.timeoutMs
    )
  );

  if (!operation.id) {
    throw new AiProviderError("Yandex async completion did not return operation id");
  }

  return operation.id;
}

export async function generateSyncCompletion(
  config: YandexConfig,
  params: AiGenerateTextParams,
  model: string
) {
  const response = await fetchJson(
    config.syncCompletionUrl,
    {
      method: "POST",
      headers: createHeaders(config),
      body: JSON.stringify(createCompletionPayload(config, params, model)),
    },
    config.timeoutMs
  );
  const text = extractText(response);
  if (!text) throw new AiProviderError("Yandex sync completion returned empty text");
  return text;
}

export async function waitForCompletion(
  config: YandexConfig,
  operationId: string
) {
  const startedAt = Date.now();
  const url = `${config.operationBaseUrl}/${operationId}`;
  let transientFailures = 0;

  while (Date.now() - startedAt < config.timeoutMs) {
    let operation;
    try {
      operation = parseOperation(await fetchJson(
        url,
        { method: "GET", headers: createHeaders(config) },
        config.timeoutMs
      ));
      transientFailures = 0;
    } catch (error) {
      const status = error instanceof AiProviderError ? error.statusCode : undefined;
      if ((status === 429 || (status && status >= 500)) && transientFailures < 5) {
        transientFailures += 1;
        await sleep(config.pollIntervalMs * transientFailures);
        continue;
      }
      throw error;
    }

    if (operation.error) {
      throw new AiProviderError(
        `Yandex async operation failed: ${errorDetails(operation.error)}`
      );
    }

    if (operation.done) {
      const text = extractText(operation.response);
      if (!text) throw new AiProviderError("Yandex async operation returned empty text");
      return text;
    }
    await sleep(config.pollIntervalMs);
  }

  throw new AiProviderError("Yandex async operation timed out");
}

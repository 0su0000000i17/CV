import { AiProviderError } from "../../errors.js";
import type { AiGenerateTextParams } from "../../types.js";
import { createHeaders, fetchJson, sleep } from "./http.js";
import { createModelUri } from "./model.js";
import { errorDetails, extractText, parseOperation } from "./response.js";
import type { YandexConfig } from "./types.js";

export async function submitCompletion(
  config: YandexConfig,
  params: AiGenerateTextParams,
  model: string
) {
  const payload = {
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
    enable_server_data_logging: config.enableServerDataLogging,
  };

  const operation = parseOperation(
    await fetchJson(
      config.completionUrl,
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

export async function waitForCompletion(
  config: YandexConfig,
  operationId: string
) {
  const startedAt = Date.now();
  const url = `${config.operationBaseUrl}/${operationId}`;

  while (Date.now() - startedAt < config.timeoutMs) {
    await sleep(config.pollIntervalMs);
    const operation = parseOperation(
      await fetchJson(
        url,
        { method: "GET", headers: createHeaders(config) },
        config.timeoutMs
      )
    );

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
  }

  throw new AiProviderError("Yandex async operation timed out");
}

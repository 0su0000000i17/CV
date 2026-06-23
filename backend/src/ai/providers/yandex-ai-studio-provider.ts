import OpenAI from "openai";

import { AiConfigurationError, AiProviderError } from "../errors.js";
import type {
  AiGenerateTextParams,
  AiGenerateTextResult,
  AiMessage,
  AiProvider,
} from "../types.js";

type YandexAiConfig = {
  apiKey: string;
  baseUrl: string;
  folderId: string;
  model: string;
  modelUri: string;
  timeoutMs: number;
  enableServerDataLogging: boolean;
};

const DEFAULT_BASE_URL = "https://ai.api.cloud.yandex.net/v1";
const DEFAULT_TIMEOUT_MS = 45_000;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AiConfigurationError(`${name} is required`);
  }

  return value;
}

function getOptionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function getBooleanEnv(name: string, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase();

  if (!value) {
    return fallback;
  }

  return value === "1" || value === "true" || value === "yes";
}

function getFolderId() {
  return (
    process.env.YANDEX_CLOUD_FOLDER_ID?.trim() ||
    process.env.YANDEX_AI_FOLDER_ID?.trim() ||
    ""
  );
}

function getYandexAiConfig(): YandexAiConfig {
  const folderId = getFolderId();

  if (!folderId) {
    throw new AiConfigurationError(
      "YANDEX_CLOUD_FOLDER_ID or YANDEX_AI_FOLDER_ID is required"
    );
  }

  const model = getRequiredEnv("YANDEX_AI_MODEL");
  const enableServerDataLogging = getBooleanEnv(
    "YANDEX_AI_ENABLE_SERVER_DATA_LOGGING",
    false
  );

  if (enableServerDataLogging && process.env.NODE_ENV === "production") {
    throw new AiConfigurationError(
      "YANDEX_AI_ENABLE_SERVER_DATA_LOGGING cannot be enabled in production"
    );
  }

  return {
    apiKey: getRequiredEnv("YANDEX_AI_API_KEY"),
    baseUrl: getOptionalEnv("YANDEX_AI_BASE_URL", DEFAULT_BASE_URL).replace(
      /\/$/,
      ""
    ),
    folderId,
    model,
    modelUri: model.startsWith("gpt://") ? model : `gpt://${folderId}/${model}`,
    timeoutMs: Number(process.env.YANDEX_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    enableServerDataLogging,
  };
}

function createClient(config: YandexAiConfig) {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: config.timeoutMs,
    maxRetries: 1,
    defaultHeaders: {
      "OpenAI-Project": config.folderId,
    },
  });
}

function splitMessages(messages: AiMessage[]) {
  const instructions = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");

  const input = messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      const role = message.role.toUpperCase();
      return `${role}:\n${message.content.trim()}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return {
    instructions: instructions || undefined,
    input: input || "",
  };
}

function extractResponseText(response: unknown) {
  if (!isRecord(response)) {
    return "";
  }

  const outputText = response.output_text;

  if (typeof outputText === "string" && outputText.trim()) {
    return outputText.trim();
  }

  const output = response.output;

  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      if (!isRecord(item) || !Array.isArray(item.content)) {
        return [];
      }

      return item.content;
    })
    .map((contentItem) => {
      if (!isRecord(contentItem)) {
        return "";
      }

      if (typeof contentItem.text === "string") {
        return contentItem.text;
      }

      if (typeof contentItem.output_text === "string") {
        return contentItem.output_text;
      }

      return "";
    })
    .join("")
    .trim();
}

function createProviderError(error: unknown) {
  if (isRecord(error)) {
    const status = typeof error.status === "number" ? error.status : undefined;
    const code = typeof error.code === "string" ? error.code : null;
    const type = typeof error.type === "string" ? error.type : null;
    const message =
      typeof error.message === "string"
        ? error.message.slice(0, 1000)
        : "AI provider request failed";

    const details = [message, code ? `code=${code}` : null, type ? `type=${type}` : null]
      .filter(Boolean)
      .join(" ");

    return new AiProviderError(details, status);
  }

  if (error instanceof Error) {
    return new AiProviderError(error.message.slice(0, 1000));
  }

  return new AiProviderError("AI provider request failed");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createYandexAiStudioProvider(): AiProvider {
  return {
    async generateText(
      params: AiGenerateTextParams
    ): Promise<AiGenerateTextResult> {
      const config = getYandexAiConfig();
      const client = createClient(config);
      const { instructions, input } = splitMessages(params.messages);

      try {
        const response = await client.responses.create({
          model: config.modelUri,
          instructions,
          input,
          temperature: params.temperature ?? 0,
          max_output_tokens: params.maxTokens,

          // Критично для ПД: не сохранять запросы на стороне Yandex AI
          // и не использовать их для отладки/обучения.
          enable_server_data_logging: config.enableServerDataLogging,
        } as any);

        const text = extractResponseText(response);

        if (!text) {
          throw new AiProviderError("AI provider returned an empty response");
        }

        return {
          text,
          provider: "yandex",
          model: config.model,
        };
      } catch (error) {
        if (error instanceof AiProviderError) {
          throw error;
        }

        throw createProviderError(error);
      }
    },
  };
}
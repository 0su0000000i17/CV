import { AiConfigurationError, AiProviderError } from "../errors.js";
import type {
  AiGenerateTextParams,
  AiGenerateTextResult,
  AiProvider,
} from "../types.js";

const DEFAULT_ASYNC_COMPLETION_URL =
  "https://ai.api.cloud.yandex.net/foundationModels/v1/completionAsync";
const DEFAULT_OPERATION_BASE_URL = "https://operation.api.cloud.yandex.net/operations";
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const ERROR_LIMIT = 3_000;
const PRO_MODEL_MIN_TOKENS = 3_000;

type Config = {
  apiKey: string;
  folderId: string;
  liteModel: string;
  proModel: string;
  completionUrl: string;
  operationBaseUrl: string;
  timeoutMs: number;
  pollIntervalMs: number;
  enableServerDataLogging: boolean;
};

type Operation = {
  id?: string;
  done?: boolean;
  response?: unknown;
  error?: unknown;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new AiConfigurationError(`${name} is required`);
  return value;
}

function optional(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function boolEnv(name: string, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === "1" || value === "true" || value === "yes";
}

function getFolderId() {
  return (
    process.env.YANDEX_CLOUD_FOLDER_ID?.trim() ||
    process.env.YANDEX_AI_FOLDER_ID?.trim() ||
    ""
  );
}

function getLiteModel() {
  return process.env.YANDEX_AI_MODEL_LITE?.trim() || process.env.YANDEX_AI_MODEL?.trim() || "";
}

function getProModel(liteModel: string) {
  return (
    process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() ||
    liteModel
  );
}

function getConfig(): Config {
  const folderId = getFolderId();
  if (!folderId) {
    throw new AiConfigurationError("YANDEX_CLOUD_FOLDER_ID or YANDEX_AI_FOLDER_ID is required");
  }

  const liteModel = getLiteModel();
  if (!liteModel) throw new AiConfigurationError("YANDEX_AI_MODEL_LITE is required");

  const enableServerDataLogging = boolEnv("YANDEX_AI_ENABLE_SERVER_DATA_LOGGING", false);
  if (enableServerDataLogging && process.env.NODE_ENV === "production") {
    throw new AiConfigurationError("YANDEX_AI_ENABLE_SERVER_DATA_LOGGING cannot be enabled in production");
  }

  return {
    apiKey: required("YANDEX_AI_API_KEY"),
    folderId,
    liteModel,
    proModel: getProModel(liteModel),
    completionUrl: optional("YANDEX_AI_ASYNC_COMPLETION_URL", DEFAULT_ASYNC_COMPLETION_URL),
    operationBaseUrl: optional("YANDEX_AI_OPERATION_BASE_URL", DEFAULT_OPERATION_BASE_URL).replace(/\/$/u, ""),
    timeoutMs:
      Number(process.env.YANDEX_AI_ASYNC_TIMEOUT_MS) ||
      Number(process.env.YANDEX_AI_TIMEOUT_MS) ||
      DEFAULT_TIMEOUT_MS,
    pollIntervalMs: Number(process.env.YANDEX_AI_ASYNC_POLL_INTERVAL_MS) || DEFAULT_POLL_INTERVAL_MS,
    enableServerDataLogging,
  };
}

function createModelUri(folderId: string, model: string) {
  return model.startsWith("gpt://") ? model : `gpt://${folderId}/${model}`;
}

function selectModel(config: Config, params: AiGenerateTextParams) {
  if (params.modelOverride?.trim()) return params.modelOverride.trim();
  return (params.maxTokens || 0) >= PRO_MODEL_MIN_TOKENS ? config.proModel : config.liteModel;
}

function headers(config: Config) {
  const iamToken =
    process.env.YANDEX_AI_IAM_TOKEN?.trim() ||
    process.env.YC_IAM_TOKEN?.trim() ||
    process.env.IAM_TOKEN?.trim();

  return {
    "Content-Type": "application/json",
    Authorization: iamToken ? `Bearer ${iamToken}` : `Api-Key ${config.apiKey}`,
    "x-folder-id": config.folderId,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOperation(value: unknown): Operation {
  if (!isRecord(value)) throw new AiProviderError("Yandex async API returned invalid operation");
  return {
    id: typeof value.id === "string" ? value.id : undefined,
    done: typeof value.done === "boolean" ? value.done : undefined,
    response: value.response,
    error: value.error,
  };
}

function errorDetails(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, ERROR_LIMIT);
  if (isRecord(value)) {
    const message = typeof value.message === "string" ? value.message : "";
    const code = typeof value.code === "string" || typeof value.code === "number" ? `code=${value.code}` : "";
    const details = typeof value.details === "string" ? value.details : "";
    return [message, code, details].filter(Boolean).join(" ") || JSON.stringify(value).slice(0, ERROR_LIMIT);
  }
  return String(value).slice(0, ERROR_LIMIT);
}

function extractText(response: unknown) {
  if (!isRecord(response)) return "";

  const outputText = response.output_text;
  if (typeof outputText === "string" && outputText.trim()) return outputText.trim();

  const alternatives = response.alternatives;
  if (Array.isArray(alternatives)) {
    const first = alternatives[0];
    if (isRecord(first)) {
      const message = first.message;
      if (isRecord(message) && typeof message.text === "string" && message.text.trim()) {
        return message.text.trim();
      }
      if (typeof first.text === "string" && first.text.trim()) return first.text.trim();
    }
  }

  return "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(timeoutMs, 120_000));

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new AiProviderError(
        `Yandex async request failed: HTTP ${response.status} ${JSON.stringify(parsed || text).slice(0, ERROR_LIMIT)}`,
        response.status
      );
    }

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

async function submitCompletion(config: Config, params: AiGenerateTextParams, model: string) {
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
      { method: "POST", headers: headers(config), body: JSON.stringify(payload) },
      config.timeoutMs
    )
  );

  if (!operation.id) throw new AiProviderError("Yandex async completion did not return operation id");
  return operation.id;
}

async function waitForCompletion(config: Config, operationId: string) {
  const startedAt = Date.now();
  const url = `${config.operationBaseUrl}/${operationId}`;

  while (Date.now() - startedAt < config.timeoutMs) {
    await sleep(config.pollIntervalMs);
    const operation = parseOperation(
      await fetchJson(url, { method: "GET", headers: headers(config) }, config.timeoutMs)
    );

    if (operation.error) {
      throw new AiProviderError(`Yandex async operation failed: ${errorDetails(operation.error)}`);
    }

    if (operation.done) {
      const text = extractText(operation.response);
      if (!text) throw new AiProviderError("Yandex async operation returned empty text");
      return text;
    }
  }

  throw new AiProviderError("Yandex async operation timed out");
}

function toProviderError(error: unknown) {
  if (error instanceof AiProviderError) return error;
  if (error instanceof Error) return new AiProviderError(error.message.slice(0, 1000));
  return new AiProviderError("AI provider request failed");
}

export function createYandexAiStudioProvider(): AiProvider {
  return {
    async generateText(params: AiGenerateTextParams): Promise<AiGenerateTextResult> {
      const config = getConfig();
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

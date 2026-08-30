import { AiConfigurationError } from "../../errors.js";
import type { YandexConfig } from "./types.js";

const DEFAULT_SYNC_COMPLETION_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
const DEFAULT_ASYNC_COMPLETION_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync";
const DEFAULT_OPERATION_BASE_URL = "https://operation.api.cloud.yandex.net/operations";
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_POLL_INTERVAL_MS = 1_000;

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

export function getCompletionMode(value = process.env.YANDEX_AI_COMPLETION_MODE) {
  return value?.trim().toLowerCase() === "async" ? "async" as const : "sync" as const;
}

function getFolderId() {
  return (
    process.env.YANDEX_CLOUD_FOLDER_ID?.trim() ||
    process.env.YANDEX_AI_FOLDER_ID?.trim() ||
    ""
  );
}

function getLiteModel() {
  return (
    process.env.YANDEX_AI_MODEL_LITE?.trim() ||
    process.env.YANDEX_AI_MODEL?.trim() ||
    ""
  );
}

function getProModel(liteModel: string) {
  return (
    process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() ||
    liteModel
  );
}

function getServerDataLoggingFlag() {
  const enabled = boolEnv("YANDEX_AI_ENABLE_SERVER_DATA_LOGGING", false);

  if (enabled && process.env.NODE_ENV === "production") {
    throw new AiConfigurationError(
      "YANDEX_AI_ENABLE_SERVER_DATA_LOGGING cannot be enabled in production"
    );
  }

  return enabled;
}

export function getYandexConfig(): YandexConfig {
  const folderId = getFolderId();
  if (!folderId) {
    throw new AiConfigurationError(
      "YANDEX_CLOUD_FOLDER_ID or YANDEX_AI_FOLDER_ID is required"
    );
  }

  const liteModel = getLiteModel();
  if (!liteModel) throw new AiConfigurationError("YANDEX_AI_MODEL_LITE is required");

  return {
    apiKey: required("YANDEX_AI_API_KEY"),
    folderId,
    liteModel,
    proModel: getProModel(liteModel),
    completionMode: getCompletionMode(),
    syncCompletionUrl: optional("YANDEX_AI_SYNC_COMPLETION_URL", DEFAULT_SYNC_COMPLETION_URL),
    asyncCompletionUrl: optional("YANDEX_AI_ASYNC_COMPLETION_URL", DEFAULT_ASYNC_COMPLETION_URL),
    operationBaseUrl: optional("YANDEX_AI_OPERATION_BASE_URL", DEFAULT_OPERATION_BASE_URL).replace(/\/$/u, ""),
    timeoutMs:
      Number(process.env.YANDEX_AI_ASYNC_TIMEOUT_MS) ||
      Number(process.env.YANDEX_AI_TIMEOUT_MS) ||
      DEFAULT_TIMEOUT_MS,
    pollIntervalMs: Math.max(
      500,
      Number(process.env.YANDEX_AI_ASYNC_POLL_INTERVAL_MS) || DEFAULT_POLL_INTERVAL_MS,
    ),
    enableServerDataLogging: getServerDataLoggingFlag(),
  };
}

import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiGenerateTextResult, AiMessage } from "../ai/types.js";
import type { AiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import type {
  AdaptationSettings,
  ResumeAdaptationResult,
  ResumeVacancyFitResult,
} from "./types.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
  ADAPT_VACANCY_MAX_CHARS,
} from "./adaptation-generation/config.js";
import { applyAdaptationFitGuard } from "./adaptation-generation/fit-guard.js";
import { parseJsonFromModelResponse } from "./adaptation-generation/json-response.js";
import { normalizeAdaptationResult } from "./adaptation-generation/normalize-adaptation-result.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./adaptation-generation/prompts.js";

const ADAPTATION_MODEL_ENV = "YANDEX_AI_ADAPTATION_MODEL";
const ADAPTATION_EXECUTION_MODE_ENV = "YANDEX_AI_ADAPTATION_EXECUTION_MODE";
const DEFAULT_ASYNC_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_ASYNC_POLL_INTERVAL_MS = 5_000;
const DEFAULT_ASYNC_COMPLETION_URL =
  "https://ai.api.cloud.yandex.net/foundationModels/v1/completionAsync";
const DEFAULT_OPERATION_BASE_URL = "https://operation.api.cloud.yandex.net/operations";
const ASYNC_ERROR_LIMIT = 3_000;

type GenerateResumeAdaptationParams = {
  resumeMarkdown: string;
  vacancy: NormalizedVacancy;
  vacancyText?: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
  debugWriter?: AiDebugArtifactWriter | null;
};

type GenerateResumeAdaptationOutput = {
  adaptation: ResumeAdaptationResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};

type YandexOperation = {
  id?: string;
  done?: boolean;
  response?: unknown;
  error?: unknown;
};

function getAdaptationModelOverride() {
  return process.env[ADAPTATION_MODEL_ENV]?.trim() || undefined;
}

function isYandexAsyncAdaptationEnabled() {
  return process.env[ADAPTATION_EXECUTION_MODE_ENV]?.trim().toLowerCase() === "async";
}

function getOptionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function getFolderId() {
  return (
    process.env.YANDEX_CLOUD_FOLDER_ID?.trim() ||
    process.env.YANDEX_AI_FOLDER_ID?.trim() ||
    ""
  );
}

function getAsyncTimeoutMs() {
  return (
    Number(process.env.YANDEX_AI_ASYNC_TIMEOUT_MS) ||
    Number(process.env.YANDEX_AI_TIMEOUT_MS) ||
    DEFAULT_ASYNC_TIMEOUT_MS
  );
}

function getAsyncPollIntervalMs() {
  return Number(process.env.YANDEX_AI_ASYNC_POLL_INTERVAL_MS) || DEFAULT_ASYNC_POLL_INTERVAL_MS;
}

function getAsyncCompletionUrl() {
  return getOptionalEnv("YANDEX_AI_ASYNC_COMPLETION_URL", DEFAULT_ASYNC_COMPLETION_URL);
}

function getOperationBaseUrl() {
  return getOptionalEnv("YANDEX_AI_OPERATION_BASE_URL", DEFAULT_OPERATION_BASE_URL).replace(/\/$/u, "");
}

function createModelUri(folderId: string, model: string) {
  return model.startsWith("gpt://") ? model : `gpt://${folderId}/${model}`;
}

function getAsyncAuthorizationHeader() {
  const iamToken =
    process.env.YANDEX_AI_IAM_TOKEN?.trim() ||
    process.env.YC_IAM_TOKEN?.trim() ||
    process.env.IAM_TOKEN?.trim();

  if (iamToken) {
    return `Bearer ${iamToken}`;
  }

  const apiKey = process.env.YANDEX_AI_API_KEY?.trim();
  if (apiKey) {
    return `Api-Key ${apiKey}`;
  }

  throw new Error("YANDEX_AI_API_KEY or YANDEX_AI_IAM_TOKEN is required");
}

function createAsyncHeaders(folderId: string) {
  return {
    "Content-Type": "application/json",
    Authorization: getAsyncAuthorizationHeader(),
    "x-folder-id": folderId,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringifyErrorDetails(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (isRecord(value)) {
    const message = typeof value.message === "string" ? value.message : "";
    const code = typeof value.code === "number" || typeof value.code === "string" ? `code=${value.code}` : "";
    const details = typeof value.details === "string" ? value.details : "";
    const compact = [message, code, details].filter(Boolean).join(" ");
    return compact || JSON.stringify(value).slice(0, ASYNC_ERROR_LIMIT);
  }
  return String(value);
}

async function fetchJson(
  url: string,
  init: Parameters<typeof fetch>[1],
  errorPrefix: string
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(getAsyncTimeoutMs(), 120_000));

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    const body = await response.text();
    const parsed = body ? JSON.parse(body) : null;

    if (!response.ok) {
      throw new Error(
        `${errorPrefix}: HTTP ${response.status} ${JSON.stringify(parsed || body).slice(0, ASYNC_ERROR_LIMIT)}`
      );
    }

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

function parseOperation(value: unknown): YandexOperation {
  if (!isRecord(value)) {
    throw new Error("Yandex async API returned invalid operation response");
  }

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    done: typeof value.done === "boolean" ? value.done : undefined,
    response: value.response,
    error: value.error,
  };
}

function extractAsyncResponseText(response: unknown) {
  if (!isRecord(response)) return "";
  const alternatives = response.alternatives;
  if (!Array.isArray(alternatives)) return "";

  const first = alternatives[0];
  if (!isRecord(first)) return "";

  const message = first.message;
  if (isRecord(message) && typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (typeof first.text === "string" && first.text.trim()) {
    return first.text.trim();
  }

  return "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function submitAsyncCompletion(params: {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
  modelUri: string;
  folderId: string;
}) {
  const payload = {
    modelUri: params.modelUri,
    completionOptions: {
      stream: false,
      temperature: params.temperature,
      maxTokens: String(params.maxTokens),
      reasoningOptions: {
        mode: "DISABLED",
      },
    },
    messages: params.messages.map((message) => ({
      role: message.role,
      text: message.content,
    })),
  };

  const operation = parseOperation(
    await fetchJson(
      getAsyncCompletionUrl(),
      {
        method: "POST",
        headers: createAsyncHeaders(params.folderId),
        body: JSON.stringify(payload),
      },
      "Yandex async completion request failed"
    )
  );

  if (!operation.id) {
    throw new Error("Yandex async completion did not return operation id");
  }

  return operation.id;
}

async function waitForAsyncCompletion(params: {
  operationId: string;
  folderId: string;
}) {
  const startedAt = Date.now();
  const timeoutMs = getAsyncTimeoutMs();
  const pollIntervalMs = getAsyncPollIntervalMs();
  const operationUrl = `${getOperationBaseUrl()}/${params.operationId}`;

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(pollIntervalMs);
    const operation = parseOperation(
      await fetchJson(
        operationUrl,
        {
          method: "GET",
          headers: createAsyncHeaders(params.folderId),
        },
        "Yandex async operation status request failed"
      )
    );

    if (operation.error) {
      throw new Error(`Yandex async operation failed: ${stringifyErrorDetails(operation.error)}`);
    }

    if (operation.done) {
      const text = extractAsyncResponseText(operation.response);
      if (!text) {
        throw new Error("Yandex async operation returned empty completion text");
      }
      return text;
    }
  }

  throw new Error("Yandex async adaptation timed out");
}

async function generateTextWithYandexAsync(params: {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
  modelOverride?: string;
}): Promise<AiGenerateTextResult> {
  const folderId = getFolderId();
  if (!folderId) {
    throw new Error("YANDEX_CLOUD_FOLDER_ID or YANDEX_AI_FOLDER_ID is required");
  }

  const model = params.modelOverride?.trim() || process.env.YANDEX_AI_MODEL?.trim();
  if (!model) {
    throw new Error("YANDEX_AI_MODEL or YANDEX_AI_ADAPTATION_MODEL is required");
  }

  const modelUri = createModelUri(folderId, model);
  const operationId = await submitAsyncCompletion({
    messages: params.messages,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    modelUri,
    folderId,
  });
  const text = await waitForAsyncCompletion({ operationId, folderId });

  return {
    text,
    provider: "yandex-async-rest",
    model: modelUri,
  };
}

async function generateAdaptationText(params: {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
  modelOverride?: string;
}) {
  if (isYandexAsyncAdaptationEnabled()) {
    return generateTextWithYandexAsync(params);
  }

  const aiProvider = getAiProvider();
  return aiProvider.generateText(params);
}

export async function generateResumeAdaptation(
  params: GenerateResumeAdaptationParams
): Promise<GenerateResumeAdaptationOutput> {
  if (!params.fit.canAdapt || params.fit.adaptationMode === "blocked") {
    throw new Error("Resume vacancy fit is blocked");
  }

  const vacancyText =
    params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);
  const resumeForPrompt = params.resumeMarkdown
    .trim()
    .slice(0, ADAPT_RESUME_MAX_CHARS);
  const vacancyForPrompt = vacancyText.trim().slice(0, ADAPT_VACANCY_MAX_CHARS);

  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: createUserPrompt({
        resumeMarkdown: resumeForPrompt,
        vacancyText: vacancyForPrompt,
        fit: params.fit,
        settings: params.settings,
      }),
    },
  ];

  await params.debugWriter?.writeJson("01-input.json", {
    settings: params.settings,
    fit: params.fit,
    resumeChars: resumeForPrompt.length,
    vacancyChars: vacancyForPrompt.length,
    executionMode: isYandexAsyncAdaptationEnabled() ? "async" : "sync",
  });
  await params.debugWriter?.writeJson("02-prompts.json", { messages });

  const modelOverride = getAdaptationModelOverride();
  const generationResult = await generateAdaptationText({
    messages,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    modelOverride,
  });

  await params.debugWriter?.writeText("03-model-output.txt", generationResult.text);
  await params.debugWriter?.writeJson("04-generation.json", {
    provider: generationResult.provider,
    model: generationResult.model,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    executionMode: isYandexAsyncAdaptationEnabled() ? "async" : "sync",
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  await params.debugWriter?.writeJson("05-parsed.json", parsedJson);

  const normalized = normalizeAdaptationResult(parsedJson);
  await params.debugWriter?.writeJson("06-normalized.json", normalized);

  const guarded = applyAdaptationFitGuard(normalized, params.fit);
  await params.debugWriter?.writeJson("07-fit-guarded.json", guarded);

  return {
    adaptation: guarded,
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: {
      resumeChars: resumeForPrompt.length,
      vacancyChars: vacancyForPrompt.length,
    },
  };
}

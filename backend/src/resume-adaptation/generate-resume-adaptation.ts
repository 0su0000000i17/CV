import { spawn } from "node:child_process";
import path from "node:path";

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
const ASYNC_STDERR_LIMIT = 3_000;

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

type AsyncRunnerPayload = {
  model: string;
  messages: Array<{
    role: AiMessage["role"];
    text: string;
  }>;
  temperature: number;
  maxTokens: number;
};

type AsyncRunnerResult = {
  text?: unknown;
  provider?: unknown;
  model?: unknown;
  usage?: unknown;
  modelVersion?: unknown;
};

function getAdaptationModelOverride() {
  return process.env[ADAPTATION_MODEL_ENV]?.trim() || undefined;
}

function isYandexAsyncAdaptationEnabled() {
  return process.env[ADAPTATION_EXECUTION_MODE_ENV]?.trim().toLowerCase() === "async";
}

function getAsyncPythonPath() {
  return (
    process.env.YANDEX_AI_ASYNC_PYTHON_PATH?.trim() ||
    process.env.MARKITDOWN_PYTHON_PATH?.trim() ||
    (process.platform === "win32" ? "python" : "python3")
  );
}

function getAsyncScriptPath() {
  return (
    process.env.YANDEX_AI_ASYNC_SCRIPT_PATH?.trim() ||
    path.resolve(process.cwd(), "scripts", "yandex_async_generate.py")
  );
}

function getAsyncTimeoutMs() {
  return (
    Number(process.env.YANDEX_AI_ASYNC_TIMEOUT_MS) ||
    Number(process.env.YANDEX_AI_TIMEOUT_MS) ||
    DEFAULT_ASYNC_TIMEOUT_MS
  );
}

function getAsyncRunnerErrorMessage(stderr: string, stdout: string, code: number | null) {
  const details = (stderr || stdout || "Yandex async runner failed")
    .trim()
    .slice(0, ASYNC_STDERR_LIMIT);
  return `Yandex async adaptation failed with code ${code ?? "unknown"}: ${details}`;
}

function parseAsyncRunnerResult(stdout: string, model: string): AiGenerateTextResult {
  const output = stdout.trim();
  if (!output) {
    throw new Error("Yandex async runner returned empty output");
  }

  const parsed = JSON.parse(output) as AsyncRunnerResult;
  const text = typeof parsed.text === "string" ? parsed.text.trim() : "";

  if (!text) {
    throw new Error("Yandex async runner returned empty text");
  }

  return {
    text,
    provider: typeof parsed.provider === "string" ? parsed.provider : "yandex-async",
    model: typeof parsed.model === "string" && parsed.model.trim() ? parsed.model : model,
  };
}

async function generateTextWithYandexAsync(params: {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
  modelOverride?: string;
}): Promise<AiGenerateTextResult> {
  const model = params.modelOverride?.trim() || process.env.YANDEX_AI_MODEL?.trim();

  if (!model) {
    throw new Error("YANDEX_AI_MODEL or YANDEX_AI_ADAPTATION_MODEL is required");
  }

  const payload: AsyncRunnerPayload = {
    model,
    messages: params.messages.map((message) => ({
      role: message.role,
      text: message.content,
    })),
    temperature: params.temperature,
    maxTokens: params.maxTokens,
  };

  return await new Promise((resolve, reject) => {
    const child = spawn(getAsyncPythonPath(), [getAsyncScriptPath()], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(new Error("Yandex async adaptation timed out"));
    }, getAsyncTimeoutMs());

    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (code !== 0) {
        reject(new Error(getAsyncRunnerErrorMessage(stderr, stdout, code)));
        return;
      }

      try {
        resolve(parseAsyncRunnerResult(stdout, model));
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
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

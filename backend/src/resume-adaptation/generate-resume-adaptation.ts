import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import type { AiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
  ADAPT_VACANCY_MAX_CHARS,
} from "./adaptation-generation/config.js";
import { applyAdaptationFitGuard } from "./adaptation-generation/fit-guard.js";
import { parseJsonFromModelResponse } from "./adaptation-generation/json-response.js";
import { normalizeAdaptationResult } from "./adaptation-generation/normalize-adaptation-result.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./adaptation-generation/prompts.js";
import type {
  AdaptationSettings,
  ResumeAdaptationResult,
  ResumeVacancyFitResult,
} from "./types.js";

const ADAPTATION_MODEL_ENV = "YANDEX_AI_MODEL_PRO";
const LEGACY_ADAPTATION_MODEL_ENV = "YANDEX_AI_ADAPTATION_MODEL";

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

function getAdaptationModelOverride() {
  return (
    process.env[ADAPTATION_MODEL_ENV]?.trim() ||
    process.env[LEGACY_ADAPTATION_MODEL_ENV]?.trim() ||
    undefined
  );
}

function createAdaptationMessages(params: {
  resumeMarkdown: string;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
}): AiMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: createUserPrompt(params),
    },
  ];
}

async function writeGenerationDebug(params: {
  debugWriter?: AiDebugArtifactWriter | null;
  messages: AiMessage[];
  settings: AdaptationSettings;
  fit: ResumeVacancyFitResult;
  resumeChars: number;
  vacancyChars: number;
}) {
  await params.debugWriter?.writeJson("01-input.json", {
    settings: params.settings,
    fit: params.fit,
    resumeChars: params.resumeChars,
    vacancyChars: params.vacancyChars,
    executionMode: "async-provider",
  });
  await params.debugWriter?.writeJson("02-prompts.json", {
    messages: params.messages,
  });
}

export async function generateResumeAdaptation(
  params: GenerateResumeAdaptationParams
): Promise<GenerateResumeAdaptationOutput> {
  if (!params.fit.canAdapt || params.fit.adaptationMode === "blocked") {
    throw new Error("Resume vacancy fit is blocked");
  }

  const vacancyText = params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);
  const resumeForPrompt = params.resumeMarkdown.trim().slice(0, ADAPT_RESUME_MAX_CHARS);
  const vacancyForPrompt = vacancyText.trim().slice(0, ADAPT_VACANCY_MAX_CHARS);
  const messages = createAdaptationMessages({
    resumeMarkdown: resumeForPrompt,
    vacancyText: vacancyForPrompt,
    fit: params.fit,
    settings: params.settings,
  });

  await writeGenerationDebug({
    debugWriter: params.debugWriter,
    messages,
    settings: params.settings,
    fit: params.fit,
    resumeChars: resumeForPrompt.length,
    vacancyChars: vacancyForPrompt.length,
  });

  const generationResult = await getAiProvider().generateText({
    messages,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    modelOverride: getAdaptationModelOverride(),
  });

  await params.debugWriter?.writeText("03-model-output.txt", generationResult.text);
  await params.debugWriter?.writeJson("04-generation.json", {
    provider: generationResult.provider,
    model: generationResult.model,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    executionMode: "async-provider",
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  const normalized = normalizeAdaptationResult(parsedJson);
  const guarded = applyAdaptationFitGuard(normalized, params.fit);

  await params.debugWriter?.writeJson("05-parsed.json", parsedJson);
  await params.debugWriter?.writeJson("06-normalized.json", normalized);
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

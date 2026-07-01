import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
  ADAPT_VACANCY_MAX_CHARS,
} from "./adaptation-generation/config.js";
import {
  writeGenerationInputDebug,
  writeGenerationOutputDebug,
} from "./adaptation-generation/debug-generation.js";
import { applyAdaptationFitGuard } from "./adaptation-generation/fit-guard.js";
import type {
  GenerateResumeAdaptationOutput,
  GenerateResumeAdaptationParams,
} from "./adaptation-generation/generation-types.js";
import { parseJsonFromModelResponse } from "./adaptation-generation/json-response.js";
import { normalizeAdaptationResult } from "./adaptation-generation/normalize-adaptation-result.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./adaptation-generation/prompts.js";

const ADAPTATION_MODEL_ENV = "YANDEX_AI_MODEL_PRO";
const LEGACY_ADAPTATION_MODEL_ENV = "YANDEX_AI_ADAPTATION_MODEL";

function getAdaptationModelOverride() {
  return (
    process.env[ADAPTATION_MODEL_ENV]?.trim() ||
    process.env[LEGACY_ADAPTATION_MODEL_ENV]?.trim() ||
    undefined
  );
}

function createAdaptationMessages(
  params: Parameters<typeof createUserPrompt>[0]
): AiMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: createUserPrompt(params) },
  ];
}

function preparePromptInput(params: GenerateResumeAdaptationParams) {
  const vacancyText =
    params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);
  const resumeMarkdown = params.resumeMarkdown
    .trim()
    .slice(0, ADAPT_RESUME_MAX_CHARS);
  const vacancyForPrompt = vacancyText.trim().slice(0, ADAPT_VACANCY_MAX_CHARS);

  return {
    resumeMarkdown,
    vacancyText: vacancyForPrompt,
    fit: params.fit,
    settings: params.settings,
  };
}

export async function generateResumeAdaptation(
  params: GenerateResumeAdaptationParams
): Promise<GenerateResumeAdaptationOutput> {
  if (!params.fit.canAdapt || params.fit.adaptationMode === "blocked") {
    throw new Error("Resume vacancy fit is blocked");
  }

  const promptInput = preparePromptInput(params);
  const messages = createAdaptationMessages(promptInput);

  await writeGenerationInputDebug({
    debugWriter: params.debugWriter,
    messages,
    settings: params.settings,
    fit: params.fit,
    resumeChars: promptInput.resumeMarkdown.length,
    vacancyChars: promptInput.vacancyText.length,
  });

  const generationResult = await getAiProvider().generateText({
    messages,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    modelOverride: getAdaptationModelOverride(),
  });

  await writeGenerationOutputDebug({
    debugWriter: params.debugWriter,
    text: generationResult.text,
    provider: generationResult.provider,
    model: generationResult.model,
    maxTokens: ADAPT_MAX_TOKENS,
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
      resumeChars: promptInput.resumeMarkdown.length,
      vacancyChars: promptInput.vacancyText.length,
    },
  };
}

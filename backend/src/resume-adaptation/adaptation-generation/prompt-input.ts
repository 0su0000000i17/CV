import { prepareStructuredPromptInput } from "../../ai/structured-prompt-input.js";
import type { AiMessage } from "../../ai/types.js";
import { formatVacancyForCandidateEvaluation } from "../../vacancy-ai/format-vacancy-for-adaptation.js";
import {
  ADAPT_RESUME_MAX_CHARS,
  ADAPT_VACANCY_MAX_CHARS,
} from "./config.js";
import { writeGenerationInputDebug } from "./debug-generation.js";
import type { GenerateResumeAdaptationParams } from "./generation-types.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./prompts.js";

export function getAdaptationModelOverride() {
  return (
    process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() ||
    undefined
  );
}

export async function createAdaptationPrompt(
  params: GenerateResumeAdaptationParams
) {
  const vacancyText = formatVacancyForCandidateEvaluation(params.vacancy);
  const input = {
    resumeMarkdown: prepareStructuredPromptInput(
      params.resumeMarkdown,
      ADAPT_RESUME_MAX_CHARS
    ),
    vacancyText: vacancyText.trim().slice(0, ADAPT_VACANCY_MAX_CHARS),
    fit: params.fit,
    settings: params.settings,
    confirmedFacts: params.confirmedFacts,
  };
  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: createUserPrompt(input) },
  ];
  await writeGenerationInputDebug({
    debugWriter: params.debugWriter,
    messages,
    settings: params.settings,
    fit: params.fit,
    resumeChars: input.resumeMarkdown.length,
    vacancyChars: input.vacancyText.length,
  });
  return { input, messages };
}

import { getAiProvider } from "../ai/get-ai-provider.js";
import { prepareStructuredPromptInput } from "../ai/structured-prompt-input.js";
import type { AiMessage } from "../ai/types.js";
import { parseJsonFromModelResponse } from "../resume-adaptation/adaptation-generation/json-response.js";
import {
  normalizeCoverLetterResult,
  normalizeFinalCoverLetter,
} from "./generation/normalize.js";
import { createCoverLetterAdaptationContext } from "./generation/adaptation-context.js";
import {
  COVER_LETTER_ADAPTATION_MAX_CHARS,
  COVER_LETTER_MAX_TOKENS,
  COVER_LETTER_RESUME_MAX_CHARS,
  COVER_LETTER_VACANCY_MAX_CHARS,
} from "./generation/config.js";
import { COVER_LETTER_SYSTEM_PROMPT } from "./generation/system-prompt.js";
import { createCoverLetterUserPrompt } from "./generation/user-prompt.js";
import type {
  GenerateCoverLetterParams,
  GenerateCoverLetterResult,
} from "./types.js";

export async function generateCoverLetter(
  params: GenerateCoverLetterParams
): Promise<GenerateCoverLetterResult> {
  const resume = params.resumeMarkdown.trim().slice(0, COVER_LETTER_RESUME_MAX_CHARS);
  const vacancy = params.vacancyText.trim().slice(0, COVER_LETTER_VACANCY_MAX_CHARS);
  const adaptation = params.adaptation
    ? prepareStructuredPromptInput(
        JSON.stringify(createCoverLetterAdaptationContext(params.adaptation)),
        COVER_LETTER_ADAPTATION_MAX_CHARS
      )
    : null;
  const messages: AiMessage[] = [
    { role: "system", content: COVER_LETTER_SYSTEM_PROMPT },
    {
      role: "user",
      content: createCoverLetterUserPrompt({
        resumeMarkdown: resume,
        vacancyText: vacancy,
        tone: params.tone,
        adaptationJson: adaptation,
      }),
    },
  ];
  const generation = await getAiProvider().generateText({
    messages,
    temperature: 0.24,
    maxTokens: COVER_LETTER_MAX_TOKENS,
    jsonObject: true,
  });
  const normalized = normalizeCoverLetterResult(
    parseJsonFromModelResponse(generation.text)
  );
  return {
    coverLetter: normalizeFinalCoverLetter(normalized.coverLetter, params.tone),
    warnings: normalized.warnings,
    generation: { provider: generation.provider, model: generation.model },
    meta: {
      resumeChars: resume.length,
      vacancyChars: vacancy.length,
      tone: params.tone,
      usedAdaptation: Boolean(params.adaptation),
    },
  };
}

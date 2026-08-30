import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import { getSafeErrorMessage } from "../utils/api-responses.js";
import {
  createVacancyNormalizationCacheMetadata,
  upsertVacancyNormalizationCache,
} from "./vacancy-normalization-cache.js";
import {
  VACANCY_MAX_TOKENS,
  VACANCY_TEXT_MAX_CHARS,
} from "./normalization/config.js";
import { createDeterministicVacancyFallback } from "./normalization/deterministic-fallback.js";
import { normalizeVacancy, parseVacancyJson } from "./normalization/json.js";
import { buildVacancyUserPrompt, VACANCY_SYSTEM_PROMPT } from "./normalization/prompt.js";
import type {
  VacancyNormalizationResult,
  VacancySourceMetadata,
} from "./types.js";

export async function normalizeVacancyWithAi(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): Promise<VacancyNormalizationResult> {
  const cache = createVacancyNormalizationCacheMetadata({
    text: params.text,
    metadata: params.metadata,
    systemPrompt: VACANCY_SYSTEM_PROMPT,
    maxTokens: VACANCY_MAX_TOKENS,
    textMaxChars: VACANCY_TEXT_MAX_CHARS,
  });
  try {
    const messages: AiMessage[] = [
      { role: "system", content: VACANCY_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildVacancyUserPrompt(params.text, params.metadata),
      },
    ];
    const generation = await getAiProvider().generateText({
      messages,
      temperature: 0,
      maxTokens: VACANCY_MAX_TOKENS,
      jsonObject: true,
    });
    const result: VacancyNormalizationResult = {
      ok: true,
      vacancy: normalizeVacancy(parseVacancyJson(generation.text)),
      rawResponse: generation.text,
    };
    await upsertVacancyNormalizationCache({ cache, metadata: params.metadata, result });
    return result;
  } catch (error) {
    const errorMessage = getSafeErrorMessage(error);
    console.warn("[vacancy-ai] AI normalization unavailable; using local structure -", errorMessage);
    return {
      ok: true,
      vacancy: createDeterministicVacancyFallback(params),
      rawResponse: "deterministic-vacancy-fallback-v1",
    };
  }
}

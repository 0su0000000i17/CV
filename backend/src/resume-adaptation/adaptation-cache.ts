import { createSha256Hash, getExpectedAiSignature } from "../resume-analysis/hashing.js";
import type { ResumeVacancyFitResult, AdaptationSettings } from "./types.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
  ADAPT_VACANCY_MAX_CHARS,
} from "./adaptation-generation/config.js";
import { SYSTEM_PROMPT } from "./adaptation-generation/prompts.js";

const ADAPTATION_CACHE_VERSION = "adaptation-cache-v1";
const ADAPTATION_USER_PROMPT_VERSION = "adaptation-user-prompt-v1";

type StableValue =
  | string
  | number
  | boolean
  | null
  | StableValue[]
  | { [key: string]: StableValue | undefined };

export type AdaptationCacheMetadata = {
  version: string;
  cacheKey: string;
  resumeHash: string;
  vacancyHash: string;
  fitHash: string;
  settingsHash: string;
  promptHash: string;
  aiProvider: string;
  aiModel: string;
};

function normalizeString(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function stableNormalize(value: unknown): StableValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return normalizeString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(stableNormalize);

  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, StableValue>>((acc, key) => {
        acc[key] = stableNormalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return String(value);
}

function stableHash(value: unknown) {
  return createSha256Hash(JSON.stringify(stableNormalize(value)));
}

export function createAdaptationCacheMetadata(params: {
  userId: string;
  resumeId: string;
  resumePayload: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
}): AdaptationCacheMetadata {
  const aiSignature = getExpectedAiSignature();
  const resumeHash = createSha256Hash(params.resumePayload);
  const vacancyHash = stableHash({ vacancy: params.vacancy, vacancyText: params.vacancyText });
  const fitHash = stableHash(params.fit);
  const settingsHash = stableHash(params.settings);
  const promptHash = stableHash({
    systemPrompt: SYSTEM_PROMPT,
    userPromptVersion: ADAPTATION_USER_PROMPT_VERSION,
    maxTokens: ADAPT_MAX_TOKENS,
    resumeMaxChars: ADAPT_RESUME_MAX_CHARS,
    vacancyMaxChars: ADAPT_VACANCY_MAX_CHARS,
  });

  const cacheKey = stableHash({
    version: ADAPTATION_CACHE_VERSION,
    userId: params.userId,
    resumeId: params.resumeId,
    resumeHash,
    vacancyHash,
    fitHash,
    settingsHash,
    promptHash,
    aiProvider: aiSignature.provider,
    aiModel: aiSignature.model,
  });

  return {
    version: ADAPTATION_CACHE_VERSION,
    cacheKey,
    resumeHash,
    vacancyHash,
    fitHash,
    settingsHash,
    promptHash,
    aiProvider: aiSignature.provider,
    aiModel: aiSignature.model,
  };
}

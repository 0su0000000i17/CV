import { supabaseAdmin } from "../../lib/supabase.js";
import { createSha256Hash } from "../../resume-analysis/hashing.js";
import type { ResumeVacancyFitResult } from "../types.js";
import {
  FIT_MAX_TOKENS,
  FIT_RESUME_MAX_CHARS,
  FIT_VACANCY_MAX_CHARS,
} from "./config.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./prompts.js";
import {
  expectedFitModel,
  expectedFitProvider,
  stableFitHash,
} from "./cache-key.js";

// v3: fit input contains only professional vacancy data; exact reads are safe
// because prompt, model and bounded inputs are all part of the key.
const CACHE_VERSION = "resume-vacancy-fit-cache-v3";
const RESUME_PLACEHOLDER = "__RESUME_JSON__";
const VACANCY_PLACEHOLDER = "__VACANCY_TEXT__";

export type CachedResumeVacancyFitOutput = {
  fit: ResumeVacancyFitResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};

export type ResumeVacancyFitCacheMetadata = {
  version: string;
  cacheKey: string;
  resumeHash: string;
  vacancyHash: string;
  promptHash: string;
  aiProvider: string;
  aiModel: string;
};

export function createResumeVacancyFitCacheMetadata(params: {
  resumeJson: string;
  vacancyText: string;
}): ResumeVacancyFitCacheMetadata {
  const resumeForPrompt = params.resumeJson.trim().slice(0, FIT_RESUME_MAX_CHARS);
  const vacancyForPrompt = params.vacancyText.trim().slice(0, FIT_VACANCY_MAX_CHARS);
  const resumeHash = createSha256Hash(resumeForPrompt);
  const vacancyHash = stableFitHash(vacancyForPrompt);
  const promptHash = stableFitHash({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: createUserPrompt({
      resumeJson: RESUME_PLACEHOLDER,
      vacancyText: VACANCY_PLACEHOLDER,
    }),
    maxTokens: FIT_MAX_TOKENS,
    resumeMaxChars: FIT_RESUME_MAX_CHARS,
    vacancyMaxChars: FIT_VACANCY_MAX_CHARS,
  });
  const aiProvider = expectedFitProvider();
  const aiModel = expectedFitModel(FIT_MAX_TOKENS);
  const cacheKey = stableFitHash({
    version: CACHE_VERSION,
    resumeHash,
    vacancyHash,
    promptHash,
    aiProvider,
    aiModel,
  });

  return {
    version: CACHE_VERSION,
    cacheKey,
    resumeHash,
    vacancyHash,
    promptHash,
    aiProvider,
    aiModel,
  };
}

export async function upsertResumeVacancyFitCache(params: {
  cache: ResumeVacancyFitCacheMetadata;
  result: CachedResumeVacancyFitOutput;
}) {
  try {
    await supabaseAdmin.from("resume_vacancy_fit_cache").upsert(
      {
        cache_key: params.cache.cacheKey,
        version: params.cache.version,
        resume_hash: params.cache.resumeHash,
        vacancy_hash: params.cache.vacancyHash,
        prompt_hash: params.cache.promptHash,
        ai_provider: params.cache.aiProvider,
        ai_model: params.cache.aiModel,
        result: params.result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" }
    );
  } catch {
    // Cache is an optimization only. If the migration is not applied yet, keep the main flow working.
  }
}

import { supabaseAdmin } from "../lib/supabase.js";
import { createSha256Hash } from "../resume-analysis/hashing.js";
import type { VacancyNormalizationResult, VacancySourceMetadata } from "./types.js";
import { normalizeVacancy } from "./normalization/json.js";
import {
  expectedVacancyModel,
  expectedVacancyProvider,
  stableVacancyHash,
} from "./vacancy-cache-key.js";

const CACHE_VERSION = "vacancy-normalization-cache-v2";
export type VacancyNormalizationCacheMetadata = {
  version: string;
  cacheKey: string;
  textHash: string;
  metadataHash: string;
  promptHash: string;
  aiProvider: string;
  aiModel: string;
};

export function createVacancyNormalizationCacheMetadata(params: {
  text: string;
  metadata: VacancySourceMetadata;
  systemPrompt: string;
  maxTokens: number;
  textMaxChars: number;
}): VacancyNormalizationCacheMetadata {
  const textForPrompt = params.text.trim().slice(0, params.textMaxChars);
  const textHash = createSha256Hash(textForPrompt);
  const metadataHash = stableVacancyHash(params.metadata);
  const promptHash = stableVacancyHash({
    systemPrompt: params.systemPrompt,
    maxTokens: params.maxTokens,
    textMaxChars: params.textMaxChars,
  });
  const aiProvider = expectedVacancyProvider();
  const aiModel = expectedVacancyModel(params.maxTokens);
  const cacheKey = stableVacancyHash({
    version: CACHE_VERSION,
    textHash,
    metadataHash,
    promptHash,
    aiProvider,
    aiModel,
  });

  return {
    version: CACHE_VERSION,
    cacheKey,
    textHash,
    metadataHash,
    promptHash,
    aiProvider,
    aiModel,
  };
}

export async function upsertVacancyNormalizationCache(params: {
  cache: VacancyNormalizationCacheMetadata;
  metadata: VacancySourceMetadata;
  result: VacancyNormalizationResult;
}) {
  try {
    await supabaseAdmin.from("vacancy_normalization_cache").upsert(
      {
        cache_key: params.cache.cacheKey,
        version: params.cache.version,
        text_hash: params.cache.textHash,
        metadata_hash: params.cache.metadataHash,
        prompt_hash: params.cache.promptHash,
        ai_provider: params.cache.aiProvider,
        ai_model: params.cache.aiModel,
        metadata: params.metadata,
        result: params.result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" }
    );
  } catch {
    // Cache is an optimization only. If the migration is not applied yet, keep the main flow working.
  }
}

export async function findVacancyNormalizationCache(
  cache: VacancyNormalizationCacheMetadata,
): Promise<VacancyNormalizationResult | null> {
  try {
    const { data, error } = await supabaseAdmin.from("vacancy_normalization_cache")
      .select("result").eq("cache_key", cache.cacheKey).maybeSingle();
    if (error || !data || typeof data.result !== "object" || !data.result) return null;
    const stored = data.result as Record<string, unknown>;
    if (stored.ok !== true || typeof stored.rawResponse !== "string") return null;
    return {
      ok: true,
      vacancy: normalizeVacancy(stored.vacancy),
      rawResponse: stored.rawResponse,
    };
  } catch {
    return null;
  }
}

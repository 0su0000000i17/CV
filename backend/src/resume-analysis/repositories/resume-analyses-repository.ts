import {
  RESUME_ANALYSIS_PROMPT_VERSION,
  RESUME_ANALYSIS_RUBRIC_VERSION,
  RESUME_ANALYSIS_SCHEMA_VERSION,
  RESUME_ANALYSIS_SCORING_VERSION,
  RESUME_ANALYSIS_SELECT,
  RESUME_EXTRACTION_VERSION,
  RESUME_SANITIZER_VERSION,
} from "../constants.js";
import type {
  ResumeAnalysisCacheRow,
  ResumeAnalysisRow,
  ResumeContentHashes,
} from "../types.js";
import { supabaseAdmin } from "../../lib/supabase.js";

type AiAnalysisResult = {
  analysis: {
    score: number;
    targetRole?: string | null;
    [key: string]: unknown;
  };
  rawAiAnalysis: unknown;
  diagnostics: unknown;
  provider: string;
  model: string;
};

export async function findLatestResumeAnalysis(params: {
  userId: string;
  resumeId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resume_analyses")
    .select(RESUME_ANALYSIS_SELECT)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as unknown as ResumeAnalysisRow | null;
}

export async function findCurrentResumeReusableAnalysis(params: {
  userId: string;
  resumeId: string;
  cacheKey: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resume_analyses")
    .select(RESUME_ANALYSIS_SELECT)
    .eq("user_id", params.userId)
    .eq("resume_id", params.resumeId)
    .eq("cache_key", params.cacheKey)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as unknown as ResumeAnalysisRow | null;
}

export async function createResumeAnalysisFromCache(params: {
  userId: string;
  resumeId: string;
  cache: ResumeAnalysisCacheRow;
}) {
  const { data, error } = await supabaseAdmin
    .from("resume_analyses")
    .insert({
      resume_id: params.resumeId,
      user_id: params.userId,
      score: params.cache.score,
      overall_score: params.cache.overall_score,
      analysis: params.cache.analysis,
      raw_ai_analysis: params.cache.raw_ai_analysis,
      diagnostics: params.cache.diagnostics,
      provider: params.cache.provider,
      model: params.cache.model,
      rubric_version: params.cache.rubric_version,
      markdown_chars: params.cache.markdown_chars,
      markdown_limited: params.cache.markdown_limited,
      content_hash: params.cache.content_hash,
      source_file_hash: params.cache.source_file_hash,
      raw_markdown_hash: params.cache.raw_markdown_hash,
      normalized_markdown_hash: params.cache.normalized_markdown_hash,
      sanitized_markdown_hash: params.cache.sanitized_markdown_hash,
      returned_markdown_hash: params.cache.returned_markdown_hash,
      extraction_version: params.cache.extraction_version,
      sanitizer_version: params.cache.sanitizer_version,
      prompt_version: params.cache.prompt_version,
      analysis_schema_version: params.cache.analysis_schema_version,
      scoring_version: params.cache.scoring_version,
      cache_key: params.cache.cache_key,
      cache_hit: true,
      cache_id: params.cache.id,
    })
    .select(RESUME_ANALYSIS_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as ResumeAnalysisRow;
}

export async function saveFreshResumeAnalysis(params: {
  userId: string;
  resumeId: string;
  aiResult: AiAnalysisResult;
  hashes: ResumeContentHashes;
  cacheKey: string;
  markdownChars: number;
  markdownLimited: boolean;
}) {
  const { data, error } = await supabaseAdmin
    .from("resume_analyses")
    .insert({
      resume_id: params.resumeId,
      user_id: params.userId,
      score: params.aiResult.analysis.score,
      overall_score: params.aiResult.analysis.score,
      analysis: params.aiResult.analysis,
      raw_ai_analysis: params.aiResult.rawAiAnalysis,
      diagnostics: params.aiResult.diagnostics,
      provider: params.aiResult.provider,
      model: params.aiResult.model,
      rubric_version: RESUME_ANALYSIS_RUBRIC_VERSION,
      markdown_chars: params.markdownChars,
      markdown_limited: params.markdownLimited,
      content_hash: params.hashes.contentHash,
      source_file_hash: params.hashes.sourceFileHash,
      raw_markdown_hash: params.hashes.rawMarkdownHash,
      normalized_markdown_hash: params.hashes.normalizedMarkdownHash,
      sanitized_markdown_hash: params.hashes.sanitizedMarkdownHash,
      returned_markdown_hash: params.hashes.returnedMarkdownHash,
      extraction_version: RESUME_EXTRACTION_VERSION,
      sanitizer_version: RESUME_SANITIZER_VERSION,
      prompt_version: RESUME_ANALYSIS_PROMPT_VERSION,
      analysis_schema_version: RESUME_ANALYSIS_SCHEMA_VERSION,
      scoring_version: RESUME_ANALYSIS_SCORING_VERSION,
      cache_key: params.cacheKey,
      cache_hit: false,
      cache_id: null,
    })
    .select(RESUME_ANALYSIS_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as ResumeAnalysisRow;
}
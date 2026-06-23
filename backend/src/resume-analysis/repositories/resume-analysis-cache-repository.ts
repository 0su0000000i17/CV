import { RESUME_ANALYSIS_CACHE_SELECT } from "../constants.js";
import type { ResumeAnalysisRow, ResumeAnalysisCacheRow } from "../types.js";
import { supabaseAdmin } from "../../lib/supabase.js";

export async function findUserReusableCache(params: {
  userId: string;
  cacheKey: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resume_analysis_cache")
    .select(RESUME_ANALYSIS_CACHE_SELECT)
    .eq("user_id", params.userId)
    .eq("cache_key", params.cacheKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as unknown as ResumeAnalysisCacheRow | null;
}

export async function upsertResumeAnalysisCache(params: {
  userId: string;
  cacheKey: string;
  analysisRow: ResumeAnalysisRow;
}) {
  const row = params.analysisRow;

  if (
    !row.content_hash ||
    !row.source_file_hash ||
    !row.raw_markdown_hash ||
    !row.normalized_markdown_hash ||
    !row.sanitized_markdown_hash ||
    !row.returned_markdown_hash ||
    !row.extraction_version ||
    !row.sanitizer_version ||
    !row.prompt_version ||
    !row.analysis_schema_version ||
    !row.scoring_version
  ) {
    console.error(
      "[resumeAnalysis] Cache was not saved because analysis row is missing hash/version fields"
    );
    return;
  }

  const { error } = await supabaseAdmin.from("resume_analysis_cache").upsert(
    {
      user_id: params.userId,
      cache_key: params.cacheKey,
      score: row.score,
      overall_score: row.score,
      analysis: row.analysis,
      raw_ai_analysis: row.raw_ai_analysis,
      diagnostics: row.diagnostics,
      provider: row.provider ?? "unknown",
      model: row.model ?? "unknown",
      rubric_version: row.rubric_version,
      markdown_chars: row.markdown_chars,
      markdown_limited: row.markdown_limited,
      content_hash: row.content_hash,
      source_file_hash: row.source_file_hash,
      raw_markdown_hash: row.raw_markdown_hash,
      normalized_markdown_hash: row.normalized_markdown_hash,
      sanitized_markdown_hash: row.sanitized_markdown_hash,
      returned_markdown_hash: row.returned_markdown_hash,
      extraction_version: row.extraction_version,
      sanitizer_version: row.sanitizer_version,
      prompt_version: row.prompt_version,
      analysis_schema_version: row.analysis_schema_version,
      scoring_version: row.scoring_version,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,cache_key",
    }
  );

  if (error) {
    console.error("[resumeAnalysis] Failed to upsert analysis cache", error);
  }
}
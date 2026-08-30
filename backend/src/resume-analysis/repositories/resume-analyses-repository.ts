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
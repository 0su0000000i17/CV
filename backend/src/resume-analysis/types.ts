import type { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";

export type AnalysisStatus =
  | "idle"
  | "analyzing"
  | "completed"
  | "failed"
  | "needs_update";

export type ResumeFileRecord = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  extracted_text: string | null;
};

export type ResumeAnalysisRow = {
  id: string;
  resume_id: string;
  user_id: string;
  score: number;
  analysis: unknown;
  raw_ai_analysis: unknown;
  diagnostics: unknown;
  provider: string | null;
  model: string | null;
  rubric_version: string;
  markdown_chars: number;
  markdown_limited: boolean;
  content_hash: string | null;
  source_file_hash: string | null;
  raw_markdown_hash: string | null;
  normalized_markdown_hash: string | null;
  sanitized_markdown_hash: string | null;
  returned_markdown_hash: string | null;
  extraction_version: string | null;
  sanitizer_version: string | null;
  prompt_version: string | null;
  analysis_schema_version: string | null;
  scoring_version: string | null;
  cache_key: string | null;
  cache_hit: boolean;
  cache_id: string | null;
  created_at: string;
};

export type ResumeAnalysisCacheRow = {
  id: string;
  user_id: string;
  cache_key: string;
  score: number;
  overall_score: number;
  analysis: unknown;
  raw_ai_analysis: unknown;
  diagnostics: unknown;
  provider: string;
  model: string;
  rubric_version: string;
  markdown_chars: number;
  markdown_limited: boolean;
  content_hash: string;
  source_file_hash: string;
  raw_markdown_hash: string;
  normalized_markdown_hash: string;
  sanitized_markdown_hash: string;
  returned_markdown_hash: string;
  extraction_version: string;
  sanitizer_version: string;
  prompt_version: string;
  analysis_schema_version: string;
  scoring_version: string;
  created_at: string;
};

export type ResumeExtractionResult = Awaited<
  ReturnType<typeof extractResumeMarkdown>
>;

export type ResumeContentHashes = {
  contentHash: string;
  sourceFileHash: string;
  rawMarkdownHash: string;
  normalizedMarkdownHash: string;
  sanitizedMarkdownHash: string;
  returnedMarkdownHash: string;
};

export type AiSignature = {
  provider: string;
  model: string;
};
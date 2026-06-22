export const RESUME_ANALYSIS_RUBRIC_VERSION = "backend-v1";
export const RESUME_EXTRACTION_VERSION = "markitdown-normalize-sanitize-limit-v1";
export const RESUME_SANITIZER_VERSION = "sanitize-resume-markdown-for-ai-v1";
export const RESUME_ANALYSIS_PROMPT_VERSION = "analyze-resume-prompt-v1";
export const RESUME_ANALYSIS_SCHEMA_VERSION = "resume-analysis-schema-v1";
export const RESUME_ANALYSIS_SCORING_VERSION = "score-resume-analysis-v1";

export const RESUME_ANALYSIS_SELECT = [
  "id",
  "resume_id",
  "user_id",
  "score",
  "analysis",
  "raw_ai_analysis",
  "diagnostics",
  "provider",
  "model",
  "rubric_version",
  "markdown_chars",
  "markdown_limited",
  "content_hash",
  "source_file_hash",
  "raw_markdown_hash",
  "normalized_markdown_hash",
  "sanitized_markdown_hash",
  "returned_markdown_hash",
  "extraction_version",
  "sanitizer_version",
  "prompt_version",
  "analysis_schema_version",
  "scoring_version",
  "cache_key",
  "cache_hit",
  "cache_id",
  "created_at",
].join(", ");

export const RESUME_ANALYSIS_CACHE_SELECT = [
  "id",
  "user_id",
  "cache_key",
  "score",
  "overall_score",
  "analysis",
  "raw_ai_analysis",
  "diagnostics",
  "provider",
  "model",
  "rubric_version",
  "markdown_chars",
  "markdown_limited",
  "content_hash",
  "source_file_hash",
  "raw_markdown_hash",
  "normalized_markdown_hash",
  "sanitized_markdown_hash",
  "returned_markdown_hash",
  "extraction_version",
  "sanitizer_version",
  "prompt_version",
  "analysis_schema_version",
  "scoring_version",
  "created_at",
].join(", ");
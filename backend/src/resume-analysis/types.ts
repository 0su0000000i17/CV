export type AnalysisStatus =
  | "idle"
  | "analyzing"
  | "completed"
  | "failed"
  | "needs_update";

export type ResumeFileRecord = {
  id: string;
  file_name: string;
  file_path: string | null;
  file_type: string;
  file_size: number | null;
  extracted_text: string | null;
  source_resume_document?: unknown | null;
  editable_resume_json?: unknown | null;
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

export type ResumeExtractionResult = {
  rawMarkdown: string;
  normalizedMarkdown: string;
  sanitizedMarkdown: string;
  markdown: string;
  stats: {
    rawChars: number;
    normalizedChars: number;
    sanitizedChars: number;
    returnedChars: number;
    maxChars: number;
    limited: boolean;
  };
};

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

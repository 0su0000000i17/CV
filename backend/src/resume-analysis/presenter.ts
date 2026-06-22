import type { ResumeAnalysisRow } from "./types.js";

export function getTargetRoleFromAnalysis(analysis: unknown) {
  if (!analysis || typeof analysis !== "object") {
    return null;
  }

  const targetRole = (analysis as Record<string, unknown>).targetRole;

  return typeof targetRole === "string" && targetRole.trim()
    ? targetRole.trim()
    : null;
}

export function mapAnalysisRow(
  row: ResumeAnalysisRow,
  options?: {
    cached?: boolean;
    cacheReason?: string;
  }
) {
  return {
    resumeId: row.resume_id,
    analysis: row.analysis,
    analysisRecord: {
      id: row.id,
      score: row.score,
      createdAt: row.created_at,
      rubricVersion: row.rubric_version,
    },
    meta: {
      provider: row.provider,
      model: row.model,
      markdownChars: row.markdown_chars,
      markdownLimited: row.markdown_limited,
      diagnostics: row.diagnostics,
      cached: options?.cached ?? false,
      cacheReason: options?.cacheReason ?? null,
      contentHash: row.content_hash,
      cacheHit: row.cache_hit,
      cacheId: row.cache_id,
      promptVersion: row.prompt_version,
      analysisSchemaVersion: row.analysis_schema_version,
      scoringVersion: row.scoring_version,
    },
  };
}
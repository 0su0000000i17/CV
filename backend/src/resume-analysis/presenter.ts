import type { ResumeAnalysisRow } from "./types.js";

function sanitizeAnalysisText(value: string) {
  return value
    .replace(/быстрый\s+hr[-\s]?скан\s+слабый\s*:?\s*/giu, "")
    .replace(/hr[-\s]?скан/giu, "первичный просмотр")
    .replace(
      /ключевые достижения и ценность кандидата не считываются за первые секунды\.?/giu,
      "Ключевые достижения и ценность кандидата стоит вынести ближе к началу: сейчас они считываются не сразу при первичном просмотре."
    )
    .trim();
}

function sanitizeAnalysisValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeAnalysisText(value);
  if (Array.isArray(value)) return value.map(sanitizeAnalysisValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, sanitizeAnalysisValue(item)])
  );
}

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
    analysis: sanitizeAnalysisValue(row.analysis),
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

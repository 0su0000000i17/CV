import type { ResumeAnalysisSignals } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length ? items : undefined;
}

/**
 * Pulls the actionable parts out of a stored resume analysis row so both the
 * clarifying-questions prompt and the improvement prompt work against the
 * same audit findings instead of re-deriving (or ignoring) them.
 */
export function extractAnalysisSignals(analysis: unknown): ResumeAnalysisSignals | undefined {
  if (!isRecord(analysis)) return undefined;

  const weaknesses = toStringArray(analysis.weaknesses);
  const atsIssues = toStringArray(analysis.atsIssues);
  const missingKeywords = toStringArray(analysis.missingKeywords);
  const recommendations = toStringArray(analysis.recommendations);
  const suggestedHeadline =
    typeof analysis.suggestedHeadline === "string" && analysis.suggestedHeadline.trim()
      ? analysis.suggestedHeadline.trim()
      : undefined;
  const redFlags = Array.isArray(analysis.redFlags)
    ? analysis.redFlags
        .filter(isRecord)
        .map((flag) => ({
          type: typeof flag.type === "string" ? flag.type : "",
          explanation: typeof flag.explanation === "string" ? flag.explanation : "",
        }))
        .filter((flag) => flag.type && flag.explanation)
    : undefined;

  if (
    !weaknesses?.length &&
    !atsIssues?.length &&
    !missingKeywords?.length &&
    !recommendations?.length &&
    !suggestedHeadline &&
    !redFlags?.length
  ) {
    return undefined;
  }

  return {
    weaknesses,
    atsIssues,
    missingKeywords,
    recommendations,
    suggestedHeadline,
    redFlags: redFlags?.length ? redFlags : undefined,
  };
}

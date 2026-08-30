// Single source of truth for "what counts as a metric" across the resume
// improvement/adaptation prompts (bullet-count planning) and the fabrication
// guardrail (apply-source-resume-structure.ts). Bare numbers are intentionally
// excluded (e.g. years, tech versions, team sizes aren't metrics on their own) -
// only unit-suffixed values count.
// The optional [xх]? before the unit alternation handles the informal
// "4х недель" multiplier notation (Cyrillic х, not Latin x) common in
// Russian resumes; the bare [xх] alternative handles it standalone ("до 2х").
export const METRIC_TOKEN_PATTERN =
  /\d+(?:[.,]\d+)?\s*[xх]?\s*(?:%|сек(?:унд)?\.?|мин(?:ут)?\.?|час(?:а|ов)?|дн(?:я|ей)?|нед(?:ели|ель)?|мес(?:яц(?:а|ев)?)?|год(?:а|лет)?|раз(?:а)?|[xх]|тыс\.?|млн\.?|\+)/giu;

function normalizeMetricToken(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .replace(",", ".")
    .trim()
    // The unit alternation's trailing `\.?` (for abbreviations like "мин.")
    // also greedily swallows an unrelated sentence-final period after a
    // spelled-out unit ("...до 1,5 минут."), so the same number/unit can
    // normalize with or without a trailing dot depending on where the
    // sentence happened to end - strip it so both forms compare equal.
    .replace(/\.$/, "");
}
export function extractMetricTokens(text: string): string[] {
  const pattern = new RegExp(METRIC_TOKEN_PATTERN.source, METRIC_TOKEN_PATTERN.flags);
  const matches = text.match(pattern) || [];
  return matches.map(normalizeMetricToken);
}

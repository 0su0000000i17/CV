import { isCoveredByAny } from "./fact-coverage.js";
import { isSalaryLine } from "./experience-matching.js";
import { polishBullet, sanitizeResumeText } from "./resume-text.js";
import { clean, unique } from "./text-core.js";
import type { ExperienceItem, SupportContext } from "./types.js";
import { stripUnverifiedMetrics } from "./unsupported-metrics.js";

export function mergePreservingSourceBullets(original: string[], adapted: string[]) {
  if (!adapted.length) return unique(original);
  const merged = unique(adapted);
  for (const sourceBullet of original) {
    if (!isCoveredByAny(merged, sourceBullet)) merged.push(sourceBullet);
  }
  return merged;
}

export function mergeBullets(
  original: string[],
  adapted: string[],
  context: SupportContext,
) {
  const polished = unique(mergePreservingSourceBullets(original, adapted))
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .filter((result) => Boolean(result.text));
  return {
    bullets: polished.map((result) => result.text),
    strippedCount: polished.reduce((sum, result) => sum + result.strippedCount, 0),
  };
}

export function mergeFocus(
  originalFocus: string | null,
  adaptedFocus: string | null | undefined,
  context: SupportContext,
) {
  const adapted = stripUnverifiedMetrics(
    sanitizeResumeText(clean(adaptedFocus), context),
    context,
  ).text;
  if (adapted && !isSalaryLine(adapted)) return adapted;
  return unique(originalFocus?.split("\n") || [])
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context).text)
    .join("\n") || null;
}

export function mergePreservedFacts(
  original: ExperienceItem,
  adapted: ExperienceItem | null,
  context: SupportContext,
) {
  const result: string[] = [];
  for (const item of unique([
    ...(adapted?.preservedFacts || []),
    ...original.adaptedBullets,
  ])) {
    if (isSalaryLine(item)) continue;
    const polished = polishBullet(item, context).text;
    if (!polished || isCoveredByAny(result, polished)) continue;
    result.push(polished);
  }
  return result.slice(0, 16);
}

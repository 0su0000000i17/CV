import { isDanglingClaimText } from "./claim-support.js";
import { normalizeResumeText, sanitizeResumeText } from "./resume-text.js";
import { unique } from "./text-core.js";
import type { SupportContext } from "./types.js";

function normalizeItem(value: string, context: SupportContext) {
  const sanitized = sanitizeResumeText(normalizeResumeText(value), context);
  return sanitized && !isDanglingClaimText(sanitized) ? sanitized : null;
}

export function mergeAdditionalInfo(
  original: string[],
  adapted: string[],
  context: SupportContext,
) {
  const normalize = (items: string[]) => items
    .map((item) => normalizeItem(item, context))
    .filter((item): item is string => Boolean(item));
  return unique([...normalize(adapted), ...normalize(original)]).slice(0, 12);
}

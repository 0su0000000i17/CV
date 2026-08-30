import { applyGenderInflection } from "./gender-inflection.js";
import { isDanglingClaimText, isSupportedClaim } from "./claim-support.js";
import { repairSpacedUrls, restoreKnownSourceUrls } from "./source-urls.js";
import { clean, textKey } from "./text-core.js";
import type { SupportContext } from "./types.js";
import {
  cleanupUnsupportedClaimText,
  stripUnverifiedMetrics,
} from "./unsupported-metrics.js";

function removeUnsupportedClaim(value: string, claim: string) {
  const claimKey = textKey(claim);
  if (!claimKey || textKey(value) === claimKey) return "";
  return value.split(claim).join("");
}

function sanitizeUnsupportedClaims(value: string, context: SupportContext) {
  let result = clean(value);
  for (const claim of context.unsupportedClaims) {
    if (!claim || isSupportedClaim(claim, context)) continue;
    result = removeUnsupportedClaim(result, claim);
  }
  const cleaned = cleanupUnsupportedClaimText(result);
  return isDanglingClaimText(cleaned) ? "" : cleaned;
}

export function sanitizeResumeText(value: string, context: SupportContext) {
  return restoreKnownSourceUrls(
    applyGenderInflection(sanitizeUnsupportedClaims(value, context), context.gender),
    context.sourceUrls,
  );
}

export function normalizeResumeText(value: string) {
  const urls: string[] = [];
  const protectedText = repairSpacedUrls(clean(value)).replace(
    /https?:\/\/[^\s)]+/giu,
    (url) => {
      const token = `__RESUME_URL_${urls.length}__`;
      urls.push(url);
      return token;
    },
  );
  const normalized = protectedText.replace(/\s*\/\s*/gu, " / ").replace(/\s{2,}/gu, " ").trim();
  return urls.reduce(
    (result, url, index) => result.replace(`__RESUME_URL_${index}__`, url),
    normalized,
  );
}

export function normalizeSkillText(value: string, context: SupportContext) {
  return sanitizeResumeText(normalizeResumeText(value), context).replace(
    /(?<=[\p{L}\p{N}])\s+\/\s+(?=[\p{L}\p{N}])/gu,
    "/",
  );
}

export function polishBullet(value: string, context?: SupportContext) {
  const text = normalizeResumeText(value);
  return context
    ? stripUnverifiedMetrics(sanitizeResumeText(text, context), context)
    : { text, strippedCount: 0 };
}

export function normalizeNotAddedValue(value: string) {
  return normalizeResumeText(value)
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта:?\s*/iu, "")
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Нет\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Опыт\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Работа\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Выдумывание\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Умение\s+создавать\s+/iu, "")
    .replace(/[.,;:]+$/u, "");
}

export function normalizeNotAdded(items: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const normalized = normalizeNotAddedValue(item);
    const key = textKey(normalized);
    if (!normalized || isDanglingClaimText(normalized) || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

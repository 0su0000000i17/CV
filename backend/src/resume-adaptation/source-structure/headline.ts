import { isSupportedClaim } from "./claim-support.js";
import { normalizeResumeText, normalizeSkillText, sanitizeResumeText } from "./resume-text.js";
import { clean, unique } from "./text-core.js";
import type { SupportContext } from "./types.js";

export function filterSupportedKeywords(items: string[], context: SupportContext) {
  return unique(items)
    .map((item) => normalizeSkillText(item, context))
    .filter((item) => Boolean(item) && isSupportedClaim(item, context));
}

function isMarketingTitle(value: string) {
  return (
    /\b(?:опытн(?:ый|ая)|профессиональн(?:ый|ая)|сильн(?:ый|ая)|квалифицированн(?:ый|ая))\b/iu.test(value) ||
    /\bс\s+фокусом\s+на\b/iu.test(value) ||
    /\b(?:более\s+чем|летним\s+опытом|опыт\s+создания|экспертиза\s+в)\b/iu.test(value) ||
    clean(value).split(/\s+/u).length > 8
  );
}

export function normalizeHeadline(
  value: string | null | undefined,
  context: SupportContext,
  fallbackTitle?: string | null,
) {
  const sourceTitle = normalizeResumeText(fallbackTitle || "");
  const sanitized = sanitizeResumeText(clean(value), context)
    .replace(/^Опытн(?:ый|ая)\s+/iu, "")
    .replace(/^Профессиональн(?:ый|ая)\s+/iu, "")
    .replace(/^Сильн(?:ый|ая)\s+/iu, "")
    .replace(/^Квалифицированн(?:ый|ая)\s+/iu, "");
  if (sourceTitle && (!sanitized || isMarketingTitle(sanitized))) return sourceTitle;
  return sanitized || sourceTitle;
}

export function resolveTargetTitle(params: {
  sourceTitle?: string | null;
  adaptedTitle?: string | null;
  headline?: string | null;
  context: SupportContext;
}) {
  const sourceTitle = normalizeResumeText(params.sourceTitle || "");
  if (sourceTitle) return sourceTitle;
  const adapted = normalizeHeadline(params.adaptedTitle, params.context, sourceTitle);
  const headline = normalizeHeadline(params.headline, params.context, sourceTitle);
  return adapted || headline || null;
}

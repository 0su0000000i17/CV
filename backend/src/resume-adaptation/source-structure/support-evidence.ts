import type { SourceResumeDocument } from "../../resume-document/types.js";
import type { ResumeAdaptationResult } from "../types.js";
import { normalizeNotAddedValue } from "./resume-text.js";
import { clean, unique, uniqueStable } from "./text-core.js";

export function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }
  return [];
}

export function collectSourceUrls(
  source: SourceResumeDocument,
  original: ResumeAdaptationResult,
) {
  const urlPattern = /https?:\/\/[^\s)]+/giu;
  const urlsFrom = (value: unknown) => collectText(value).flatMap((text) =>
    Array.from(text.matchAll(urlPattern)).map((match) => match[0]),
  );
  return uniqueStable([
    ...source.personal.links,
    ...urlsFrom(source),
    ...urlsFrom(original),
  ]);
}

function extractAtomicUnsupportedClaims(value: string) {
  return clean(value)
    .split(/[,:;/()\[\]{}]+/gu)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && /[a-zа-яё0-9]/iu.test(item));
}

function isGenericForbiddenClaim(value: string) {
  return (
    /личные\s+данные|контакты/iu.test(value) ||
    /компании,\s*должности,\s*даты/iu.test(value) ||
    /повышать\s+уровень\s+кандидата/iu.test(value)
  );
}

export function createUnsupportedClaims(adapted: ResumeAdaptationResult) {
  const explicit = [
    ...adapted.adaptedResume.skills.notAdded,
    ...adapted.forbiddenClaims,
    ...adapted.warnings,
  ]
    .filter((item) => !isGenericForbiddenClaim(item))
    .flatMap((item) => [item, ...extractAtomicUnsupportedClaims(item)]);
  return unique(explicit.map(normalizeNotAddedValue)).filter(Boolean).slice(0, 80);
}

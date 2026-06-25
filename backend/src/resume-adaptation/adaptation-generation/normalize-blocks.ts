import type {
  AdaptedResumeEducation,
  AdaptedResumeExperienceItem,
  AdaptedResumeSkills,
  ResumeAdaptationTarget,
} from "../types.js";
import { isRecord, toNullableString, toStringArray } from "./normalize-helpers.js";

export function normalizeTarget(value: unknown): ResumeAdaptationTarget {
  const source = isRecord(value) ? value : {};

  return {
    title: toNullableString(source.title),
    company: toNullableString(source.company),
    seniority: toNullableString(source.seniority),
    keywordsUsed: toStringArray(source.keywordsUsed, 30),
  };
}

export function normalizeSkills(value: unknown): AdaptedResumeSkills {
  const source = isRecord(value) ? value : {};

  return {
    primary: toStringArray(source.primary, 20),
    secondary: toStringArray(source.secondary, 30),
    deprioritized: toStringArray(source.deprioritized, 20),
    notAdded: toStringArray(source.notAdded, 20),
  };
}

export function normalizeExperience(value: unknown): AdaptedResumeExperienceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        sourceIndex:
          typeof item.sourceIndex === "number" && Number.isFinite(item.sourceIndex)
            ? item.sourceIndex
            : index,
        company: toNullableString(item.company),
        position: toNullableString(item.position),
        dates: toNullableString(item.dates),
        adaptedBullets: toStringArray(item.adaptedBullets, 10),
        focus: toNullableString(item.focus),
        preservedFacts: toStringArray(item.preservedFacts, 12),
        warnings: toStringArray(item.warnings, 8),
      };
    })
    .filter((item): item is AdaptedResumeExperienceItem => Boolean(item))
    .slice(0, 7);
}

export function normalizeEducation(value: unknown): AdaptedResumeEducation {
  const source = isRecord(value) ? value : {};
  const policy = source.policy;

  return {
    policy:
      policy === "unchanged" ||
      policy === "lightly_reordered" ||
      policy === "not_found"
        ? policy
        : "unchanged",
    notes: toStringArray(source.notes, 8),
  };
}
import type { ResumeAdaptationResult } from "../types.js";
import {
  normalizeEducation,
  normalizeExperience,
  normalizeSkills,
  normalizeTarget,
} from "./normalize-blocks.js";
import { isRecord, toNullableString, toStringArray } from "./normalize-helpers.js";

function normalizeHeadline(value: unknown) {
  const headline = toNullableString(value) || "";
  return /^адаптированное\s+резюме$/iu.test(headline) ? "" : headline;
}

function getAdaptedResumeSource(source: Record<string, unknown>) {
  return isRecord(source.adaptedResume) ? source.adaptedResume : source;
}

function getTargetSource(source: Record<string, unknown>) {
  if (isRecord(source.target)) return source.target;

  return {
    keywordsUsed: source.keywordsUsed,
  };
}

export function normalizeAdaptationResult(value: unknown): ResumeAdaptationResult {
  const source = isRecord(value) ? value : {};
  const adaptedResume = getAdaptedResumeSource(source);

  return {
    target: normalizeTarget(getTargetSource(source)),
    adaptedResume: {
      headline: normalizeHeadline(adaptedResume.headline),
      summary: toNullableString(adaptedResume.summary) || "",
      skills: normalizeSkills(adaptedResume.skills),
      experience: normalizeExperience(adaptedResume.experience),
      education: normalizeEducation(adaptedResume.education),
      additionalInfo: toStringArray(adaptedResume.additionalInfo, 20),
    },
    changes: toStringArray(source.changes, 12),
    warnings: toStringArray(source.warnings, 12),
    // Not hardcoded: forbiddenClaims must reflect what actually happened,
    // not an unconditional self-attestation. The metric-fabrication guard in
    // apply-source-resume-structure.ts appends real entries here (and to
    // metricGaps) when it actually strips something.
    forbiddenClaims: normalizeForbiddenClaims(source.forbiddenClaims),
    metricGaps: [],
  };
}

function normalizeForbiddenClaims(value: unknown) {
  return Array.from(new Set(toStringArray(value, 20)));
}

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
    salary: toNullableString(source.salary),
    specializations: toStringArray(source.specializations, 20),
    employment: toNullableString(source.employment),
    schedule: toNullableString(source.schedule),
    workFormat: toNullableString(source.workFormat),
    commuteTime: toNullableString(source.commuteTime),
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
  if (!Array.isArray(value)) return [];

  const result: AdaptedResumeExperienceItem[] = [];

  value.forEach((item, index) => {
    const normalized = normalizeExperienceItem(item, index);
    if (normalized) result.push(normalized);
  });

  return result.slice(0, 7);
}

function normalizeDateRange(value: unknown) {
  const direct = toNullableString(value);
  if (direct) return direct;

  if (!isRecord(value)) return null;

  const start = toNullableString(value.start);
  const end = toNullableString(value.end);

  if (start && end) return `${start} — ${end}`;
  if (start) return start;
  if (end) return end;

  return toNullableString(value.duration);
}

function normalizeAdaptedBullets(value: Record<string, unknown>) {
  const bullets = toStringArray(value.adaptedBullets, 14);
  if (bullets.length) return bullets;

  const fallbackBullets = toStringArray(value.bullets, 14);
  if (fallbackBullets.length) return fallbackBullets;

  return toStringArray(value.blocks, 14);
}

function normalizeExperienceItem(
  value: unknown,
  index: number
): AdaptedResumeExperienceItem | null {
  if (!isRecord(value)) return null;

  return {
    sourceIndex:
      typeof value.sourceIndex === "number" && Number.isFinite(value.sourceIndex)
        ? value.sourceIndex
        : index,
    company: toNullableString(value.company),
    companyCity: toNullableString(value.companyCity),
    companyUrl: toNullableString(value.companyUrl),
    companyIndustries: toStringArray(value.companyIndustries, 20),
    position: toNullableString(value.position),
    dates: normalizeDateRange(value.dates),
    description: toNullableString(value.description),
    adaptedBullets: normalizeAdaptedBullets(value),
    focus: toNullableString(value.focus),
    preservedFacts: toStringArray(value.preservedFacts, 16),
    warnings: toStringArray(value.warnings, 8),
  };
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
    notes: toStringArray(source.notes, 12),
  };
}

import type { ResumeAdaptationResult } from "../types.js";
import {
  normalizeEducation,
  normalizeExperience,
  normalizeSkills,
  normalizeTarget,
} from "./normalize-blocks.js";
import { isRecord, toNullableString, toStringArray } from "./normalize-helpers.js";

export function normalizeAdaptationResult(value: unknown): ResumeAdaptationResult {
  const source = isRecord(value) ? value : {};
  const adaptedResume = isRecord(source.adaptedResume)
    ? source.adaptedResume
    : {};

  return {
    target: normalizeTarget(source.target),
    adaptedResume: {
      headline:
        toNullableString(adaptedResume.headline) ||
        "Адаптированное резюме",
      summary: toNullableString(adaptedResume.summary) || "",
      skills: normalizeSkills(adaptedResume.skills),
      experience: normalizeExperience(adaptedResume.experience),
      education: normalizeEducation(adaptedResume.education),
      additionalInfo: toStringArray(adaptedResume.additionalInfo, 20),
    },
    changes: toStringArray(source.changes, 12),
    warnings: toStringArray(source.warnings, 12),
    forbiddenClaims: normalizeForbiddenClaims(source.forbiddenClaims),
  };
}

function normalizeForbiddenClaims(value: unknown) {
  return Array.from(
    new Set([
      ...toStringArray(value, 20),
      "Не добавлены навыки, технологии, должности, компании, даты и метрики, которых нет в исходном резюме.",
      "Контакты и личные данные не изменялись.",
    ])
  );
}

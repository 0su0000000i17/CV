import type { ResumeAdaptationResult, ResumeVacancyFitResult } from "../types.js";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./-]+/gu, " ")
    .replace(/\s+/g, " ");
}

function includesAnyForbidden(value: string, forbidden: string[]) {
  const normalizedValue = normalize(value);

  return forbidden.some((item) => {
    const normalizedItem = normalize(item);

    return normalizedItem.length > 1 && normalizedValue.includes(normalizedItem);
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildForbiddenTerms(fit: ResumeVacancyFitResult) {
  return unique([
    ...fit.gaps,
    ...fit.blockingGaps,
    ...fit.forbiddenChanges,
  ]);
}

function filterSkills(values: string[], forbidden: string[], removed: string[]) {
  return values.filter((skill) => {
    if (!includesAnyForbidden(skill, forbidden)) {
      return true;
    }

    removed.push(skill);
    return false;
  });
}

export function applyAdaptationFitGuard(
  result: ResumeAdaptationResult,
  fit: ResumeVacancyFitResult
): ResumeAdaptationResult {
  const forbidden = buildForbiddenTerms(fit);
  const removedSkills: string[] = [];

  const primary = filterSkills(
    result.adaptedResume.skills.primary,
    forbidden,
    removedSkills
  );
  const secondary = filterSkills(
    result.adaptedResume.skills.secondary,
    forbidden,
    removedSkills
  );

  const warnings = [...result.warnings];
  const forbiddenClaims = [...result.forbiddenClaims];

  if (removedSkills.length) {
    warnings.push("Часть навыков не добавлена, потому что они не подтверждены резюме.");
    forbiddenClaims.push(
      `Не добавлены неподтверждённые навыки: ${unique(removedSkills).join(", ")}.`
    );
  }

  if (fit.adaptationMode === "limited") {
    warnings.push(
      "Адаптация выполнена осторожно: совместимость с вакансией частичная."
    );
  }

  return {
    ...result,
    adaptedResume: {
      ...result.adaptedResume,
      skills: {
        ...result.adaptedResume.skills,
        primary,
        secondary,
        notAdded: unique([
          ...result.adaptedResume.skills.notAdded,
          ...removedSkills,
          ...fit.gaps,
          ...fit.blockingGaps,
        ]).slice(0, 12),
      },
    },
    warnings: unique(warnings).slice(0, 10),
    forbiddenClaims: unique(forbiddenClaims).slice(0, 12),
  };
}
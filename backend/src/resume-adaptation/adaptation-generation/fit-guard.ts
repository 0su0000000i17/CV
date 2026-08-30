import type { ResumeAdaptationResult, ResumeVacancyFitResult } from "../types.js";
import { isConfirmedRequirement } from "./confirmed-requirement-match.js";

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

// fit.gaps/blockingGaps are computed BEFORE the candidate answered any
// clarifying questions - a gap the candidate then positively confirmed must
// stop being treated as forbidden, or this guard mechanically undoes the
// entire confirmed-questions flow (strips the skill right back out, then
// re-adds the stale gap to notAdded regardless of what the model or the
// confirmed-requirement retry produced).
function excludeConfirmed(items: string[], confirmedRequirements: string[]) {
  if (!confirmedRequirements.length) return items;
  return items.filter((item) => !isConfirmedRequirement(item, confirmedRequirements));
}

function buildForbiddenTerms(fit: ResumeVacancyFitResult, confirmedRequirements: string[]) {
  return unique([
    ...excludeConfirmed(fit.gaps, confirmedRequirements),
    ...excludeConfirmed(fit.blockingGaps, confirmedRequirements),
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
  fit: ResumeVacancyFitResult,
  confirmedRequirements: string[] = []
): ResumeAdaptationResult {
  const forbidden = buildForbiddenTerms(fit, confirmedRequirements);
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
          ...excludeConfirmed(fit.gaps, confirmedRequirements),
          ...excludeConfirmed(fit.blockingGaps, confirmedRequirements),
        ])
          // A requirement the candidate confirmed must never resurface in
          // notAdded even if the model itself put it there and the retry
          // above already fixed it, or if it slipped through some other way.
          .filter((item) => !isConfirmedRequirement(item, confirmedRequirements))
          .slice(0, 12),
      },
    },
    warnings: unique(warnings).slice(0, 10),
    forbiddenClaims: unique(forbiddenClaims).slice(0, 12),
  };
}
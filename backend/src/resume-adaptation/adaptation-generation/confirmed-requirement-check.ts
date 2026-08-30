import type { ResumeAdaptationResult } from "../types.js";
import { isConfirmedRequirement } from "./confirmed-requirement-match.js";

/**
 * A vacancy requirement the candidate positively confirmed (see
 * resolve-confirmed-requirements.ts) must land in skills, not notAdded. The
 * model is told this explicitly but has been observed echoing the
 * pre-questions gap list into notAdded regardless of what was confirmed -
 * this is the deterministic cross-check that catches it.
 */
export function findConfirmedRequirementsInNotAdded(
  confirmedRequirements: string[],
  adaptation: ResumeAdaptationResult
) {
  const notAdded = adaptation.adaptedResume.skills.notAdded;
  if (!confirmedRequirements.length || !notAdded.length) return [];

  return confirmedRequirements.filter((requirement) =>
    notAdded.some((item) => isConfirmedRequirement(item, [requirement]))
  );
}

export function createConfirmedRequirementRetryNotice(requirements: string[]) {
  return `
ОШИБКА: следующие требования вакансии кандидат ПОДТВЕРДИЛ в ответах на уточняющие вопросы, но
твой предыдущий ответ всё равно поместил их в notAdded (как будто кандидат отказался):
${requirements.map((requirement) => `- ${requirement}`).join("\n")}

Верни ИСПРАВЛЕННЫЙ полный JSON той же схемы: убери эти пункты из notAdded и добавь их в
skills.primary или skills.secondary формулировкой уровня, который подтвердил кандидат (см. блок
ПОДТВЕРЖДЁННЫЕ КАНДИДАТОМ ФАКТЫ выше) — не выдумывай более сильный уровень, чем подтверждено.
Остальные части JSON (опыт, summary, additionalInfo) оставь как в предыдущем ответе, если они
были правильными.
`.trim();
}

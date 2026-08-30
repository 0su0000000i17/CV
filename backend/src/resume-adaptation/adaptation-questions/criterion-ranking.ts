import type { NormalizedVacancy, VacancyCriterion } from "../../vacancy-ai/types.js";
import { getCandidateCriteria } from "../../vacancy-ai/candidate-criteria.js";
import type { ResumeVacancyFitResult } from "../types.js";

const STOP_WORDS = new Set([
  "для", "или", "при", "как", "что", "это", "опыт", "работа", "работы", "знание",
  "умение", "навык", "навыки", "требуется", "обязательно", "желательно", "понимание",
  "практический", "практическое", "уверенный", "владение", "использование", "работать",
]);

function tokens(value: string) {
  return value.toLowerCase().replace(/ё/gu, "е")
    .split(/[^\p{L}\p{N}+#.]+/gu)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .map((token) => /[а-я]/u.test(token) && token.length > 5 ? token.slice(0, -2) : token);
}

function overlap(left: string, right: string) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  const shared = [...a].filter((token) => b.has(token)).length;
  return shared / Math.min(a.size, b.size);
}

function isCovered(criterion: VacancyCriterion, resumeJson: string) {
  return overlap(criterion.text, resumeJson) >= (tokens(criterion.text).length <= 2 ? 1 : 0.7);
}

function fitSignals(fit: ResumeVacancyFitResult) {
  return [
    ...fit.blockingGaps.map((text) => ({ text, weight: 5 })),
    ...fit.gaps.map((text) => ({ text, weight: 3 })),
    ...fit.riskFlags.filter((flag) => flag.type === "missing_required_skill")
      .map((flag) => ({ text: flag.explanation, weight: 4 })),
  ];
}

function isCoreMismatch(criterion: VacancyCriterion, fit: ResumeVacancyFitResult) {
  return fit.riskFlags.some((flag) =>
    ["missing_core_experience", "role_mismatch", "career_change"].includes(flag.type)
    && flag.severity !== "minor" && overlap(criterion.text, flag.explanation) >= 0.5);
}

export function rankUncoveredCriteria(params: {
  vacancy: NormalizedVacancy;
  resumeJson: string;
  fit: ResumeVacancyFitResult;
}) {
  const signals = fitSignals(params.fit);
  return getCandidateCriteria(params.vacancy)
    .filter((criterion) => !["experience", "seniority"].includes(criterion.kind))
    .filter((criterion) => !isCovered(criterion, params.resumeJson))
    .filter((criterion) => !isCoreMismatch(criterion, params.fit))
    .map((criterion) => ({
      criterion,
      score: (criterion.priority === "required" ? 4 : 1)
        + Math.max(0, ...signals.map((signal) => overlap(criterion.text, signal.text) * signal.weight)),
    }))
    .sort((left, right) => right.score - left.score)
    .map(({ criterion }) => criterion);
}

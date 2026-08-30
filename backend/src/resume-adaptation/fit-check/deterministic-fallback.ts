import { getCandidateCriteria } from "../../vacancy-ai/candidate-criteria.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitLevel, ResumeVacancyFitResult } from "../types.js";

const STOP_WORDS = new Set([
  "для", "или", "при", "как", "что", "это", "опыт", "работа", "работы",
  "знание", "умение", "навык", "навыки", "требуется", "обязательно", "желательно",
]);

function tokens(value: string) {
  return value.toLowerCase().replace(/ё/gu, "е")
    .split(/[^\p{L}\p{N}+#.]+/gu)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function coverage(needle: string, haystack: string) {
  const expected = tokens(needle);
  if (!expected.length) return 0;
  const actual = new Set(tokens(haystack));
  return expected.filter((token) => actual.has(token)).length / expected.length;
}

function resumeRole(resumeJson: string) {
  try {
    const parsed = JSON.parse(resumeJson) as { target?: { title?: unknown } };
    return typeof parsed.target?.title === "string" ? parsed.target.title.trim() : null;
  } catch {
    return null;
  }
}

function fitLevel(score: number): ResumeVacancyFitLevel {
  if (score >= 86) return "strong";
  if (score >= 66) return "solid";
  if (score >= 46) return "partial";
  if (score >= 21) return "weak";
  return "impossible";
}

export function createDeterministicFitFallback(params: {
  resumeJson: string;
  vacancy: NormalizedVacancy;
}): ResumeVacancyFitResult {
  const criteria = getCandidateCriteria(params.vacancy);
  const matched = criteria.filter((item) => coverage(item.text, params.resumeJson) >= 0.7);
  const gaps = criteria.filter((item) => !matched.includes(item));
  const role = resumeRole(params.resumeJson);
  const roleMatch = role && params.vacancy.title
    ? coverage(params.vacancy.title, role) >= 0.5 || coverage(role, params.vacancy.title) >= 0.5
    : false;
  const matchRatio = criteria.length ? matched.length / criteria.length : 0.5;
  const score = Math.max(35, Math.min(85, Math.round(45 + matchRatio * 30 + (roleMatch ? 10 : 0))));
  return {
    canAdapt: true,
    fit: fitLevel(score),
    score,
    confidence: 0.35,
    resumeRole: role,
    vacancyRole: params.vacancy.title,
    careerMove: roleMatch ? "same_role" : matched.length ? "adjacent_role" : "unknown",
    adaptationMode: roleMatch && matchRatio >= 0.6 ? "safe" : "limited",
    reason: "Совместимость оценена консервативно по подтверждённым данным резюме.",
    safeAdaptationDirection: "Использовать только исходные факты и явно подтверждённые ответы кандидата.",
    matchedRequirements: matched.map((item) => item.text),
    transferableExperience: [],
    gaps: gaps.map((item) => item.text),
    blockingGaps: [],
    allowedChanges: ["Переставить акценты и уточнить подтверждённые достижения."],
    forbiddenChanges: ["Добавлять неподтверждённые навыки, опыт, компании или метрики."],
    riskFlags: gaps.slice(0, 8).map((item) => ({
      type: "missing_required_skill" as const,
      severity: item.priority === "required" ? "major" as const : "minor" as const,
      explanation: item.text,
    })),
  };
}

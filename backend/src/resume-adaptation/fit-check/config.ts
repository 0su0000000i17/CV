import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyCareerMove,
  ResumeVacancyFitLevel,
  ResumeVacancyFitRiskFlag,
} from "../types.js";

export const FIT_MAX_TOKENS = Number(process.env.AI_FIT_MAX_TOKENS) || 2_500;
export const FIT_RESUME_MAX_CHARS =
  Number(process.env.AI_FIT_RESUME_MAX_CHARS) || 18_000;
export const FIT_VACANCY_MAX_CHARS =
  Number(process.env.AI_FIT_VACANCY_MAX_CHARS) || 12_000;

export const fitLevels: ResumeVacancyFitLevel[] = [
  "impossible",
  "weak",
  "partial",
  "solid",
  "strong",
];

export const careerMoves: ResumeVacancyCareerMove[] = [
  "same_role",
  "adjacent_role",
  "stretch_role",
  "career_change",
  "unknown",
];

export const adaptationModes: ResumeVacancyAdaptationMode[] = [
  "safe",
  "limited",
  "blocked",
];

export const riskFlagTypes: ResumeVacancyFitRiskFlag["type"][] = [
  "role_mismatch",
  "missing_core_experience",
  "missing_required_skill",
  "level_mismatch",
  "domain_mismatch",
  "weak_evidence",
  "career_change",
  "over_adaptation_risk",
];

export const riskFlagSeverities: ResumeVacancyFitRiskFlag["severity"][] = [
  "minor",
  "major",
  "critical",
];

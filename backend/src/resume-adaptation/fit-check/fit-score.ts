import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyCareerMove,
  ResumeVacancyFitLevel,
  ResumeVacancyFitRiskFlag,
} from "../types.js";
import { normalizeScore } from "./normalize-helpers.js";

export type FitScoreParams = {
  rawScore: unknown;
  fit: ResumeVacancyFitLevel;
  careerMove: ResumeVacancyCareerMove;
  adaptationMode: ResumeVacancyAdaptationMode;
  matchedRequirements: string[];
  transferableExperience: string[];
  gaps: string[];
  blockingGaps: string[];
  riskFlags: ResumeVacancyFitRiskFlag[];
};

const baseByFit: Record<ResumeVacancyFitLevel, number> = {
  impossible: 8, weak: 32, partial: 55, solid: 76, strong: 92,
};
const rangeByFit: Record<ResumeVacancyFitLevel, [number, number]> = {
  impossible: [0, 20], weak: [21, 45], partial: [46, 65],
  solid: [66, 85], strong: [86, 100],
};
const careerAdjustment: Record<ResumeVacancyCareerMove, number> = {
  same_role: 7, adjacent_role: 1, stretch_role: -7,
  career_change: -18, unknown: -3,
};
const modeAdjustment: Record<ResumeVacancyAdaptationMode, number> = {
  safe: 5, limited: -4, blocked: -30,
};

export function normalizeFitScore(params: FitScoreParams) {
  const rawScore = normalizeScore(params.rawScore, params.fit);
  const riskPenalty = params.riskFlags.reduce((sum, flag) =>
    sum + (flag.severity === "critical" ? 12 : flag.severity === "major" ? 7 : 3), 0);
  const derivedScore = baseByFit[params.fit] +
    Math.min(params.matchedRequirements.length, 10) * 2 +
    Math.min(params.transferableExperience.length, 8) -
    Math.min(params.gaps.length, 10) * 3 -
    Math.min(params.blockingGaps.length, 8) * 8 - riskPenalty +
    careerAdjustment[params.careerMove] + modeAdjustment[params.adaptationMode];
  const blended = Math.round(rawScore * 0.35 + derivedScore * 0.65);
  const [minScore, maxScore] = rangeByFit[params.fit];
  return Math.max(minScore, Math.min(maxScore, blended));
}

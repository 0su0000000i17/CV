import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyCareerMove,
  ResumeVacancyFitLevel,
  ResumeVacancyFitResult,
  ResumeVacancyFitRiskFlag,
} from "../types.js";
import { adaptationModes, careerMoves, fitLevels } from "./config.js";
import {
  isRecord,
  normalizeConfidence,
  normalizeForbiddenChanges,
  normalizeRiskFlags,
  normalizeScore,
  toEnumValue,
  toNullableString,
  toStringArray,
} from "./normalize-helpers.js";

export function normalizeFitResult(value: unknown): ResumeVacancyFitResult {
  const source = isRecord(value) ? value : {};
  const fit = toEnumValue(source.fit, fitLevels, "impossible");
  const adaptationMode = toEnumValue(
    source.adaptationMode,
    adaptationModes,
    fit === "impossible" ? "blocked" : "limited"
  );

  const matchedRequirements = toStringArray(source.matchedRequirements, 12);
  const transferableExperience = toStringArray(
    source.transferableExperience,
    12
  );
  const gaps = toStringArray(source.gaps, 12);
  const blockingGaps = toStringArray(source.blockingGaps, 10);
  const riskFlags = normalizeRiskFlags(source.riskFlags);
  const careerMove = toEnumValue(source.careerMove, careerMoves, "unknown");
  const backendCanAdapt = getBackendCanAdapt({
    rawCanAdapt: source.canAdapt,
    fit,
    adaptationMode,
    matchedRequirements,
    transferableExperience,
    blockingGaps,
  });

  return {
    canAdapt: backendCanAdapt,
    fit,
    score: normalizeFitScore({
      rawScore: source.score,
      fit,
      careerMove,
      adaptationMode: backendCanAdapt ? adaptationMode : "blocked",
      matchedRequirements,
      transferableExperience,
      gaps,
      blockingGaps,
      riskFlags,
    }),
    confidence: normalizeConfidence(source.confidence),
    resumeRole: toNullableString(source.resumeRole),
    vacancyRole: toNullableString(source.vacancyRole),
    careerMove,
    adaptationMode: backendCanAdapt ? adaptationMode : "blocked",
    reason:
      toNullableString(source.reason) ||
      "Не удалось надёжно объяснить совместимость резюме и вакансии.",
    safeAdaptationDirection: backendCanAdapt
      ? toNullableString(source.safeAdaptationDirection)
      : null,
    matchedRequirements,
    transferableExperience,
    gaps,
    blockingGaps,
    allowedChanges: toStringArray(source.allowedChanges, 12),
    forbiddenChanges: normalizeForbiddenChanges(source.forbiddenChanges),
    riskFlags,
  };
}

function normalizeFitScore(params: {
  rawScore: unknown;
  fit: ResumeVacancyFitLevel;
  careerMove: ResumeVacancyCareerMove;
  adaptationMode: ResumeVacancyAdaptationMode;
  matchedRequirements: string[];
  transferableExperience: string[];
  gaps: string[];
  blockingGaps: string[];
  riskFlags: ResumeVacancyFitRiskFlag[];
}) {
  const baseByFit: Record<ResumeVacancyFitLevel, number> = {
    impossible: 8,
    weak: 32,
    partial: 55,
    solid: 76,
    strong: 92,
  };

  const rangeByFit: Record<ResumeVacancyFitLevel, [number, number]> = {
    impossible: [0, 20],
    weak: [21, 45],
    partial: [46, 65],
    solid: [66, 85],
    strong: [86, 100],
  };

  const rawScore = normalizeScore(params.rawScore, params.fit);
  const riskPenalty = params.riskFlags.reduce((sum, flag) => {
    if (flag.severity === "critical") return sum + 12;
    if (flag.severity === "major") return sum + 7;
    return sum + 3;
  }, 0);

  const careerAdjustment: Record<ResumeVacancyCareerMove, number> = {
    same_role: 7,
    adjacent_role: 1,
    stretch_role: -7,
    career_change: -18,
    unknown: -3,
  };

  const modeAdjustment: Record<ResumeVacancyAdaptationMode, number> = {
    safe: 5,
    limited: -4,
    blocked: -30,
  };

  const derivedScore =
    baseByFit[params.fit] +
    Math.min(params.matchedRequirements.length, 10) * 2 +
    Math.min(params.transferableExperience.length, 8) -
    Math.min(params.gaps.length, 10) * 3 -
    Math.min(params.blockingGaps.length, 8) * 8 -
    riskPenalty +
    careerAdjustment[params.careerMove] +
    modeAdjustment[params.adaptationMode];

  const blendedScore = Math.round(rawScore * 0.35 + derivedScore * 0.65);
  const [minScore, maxScore] = rangeByFit[params.fit];

  return Math.max(minScore, Math.min(maxScore, blendedScore));
}

function getBackendCanAdapt(params: {
  rawCanAdapt: unknown;
  fit: ResumeVacancyFitLevel;
  adaptationMode: ResumeVacancyAdaptationMode;
  matchedRequirements: string[];
  transferableExperience: string[];
  blockingGaps: string[];
}) {
  if (params.fit === "impossible" || params.adaptationMode === "blocked") {
    return false;
  }

  if (params.rawCanAdapt !== true) {
    return false;
  }

  if (
    params.fit === "weak" &&
    params.matchedRequirements.length === 0 &&
    params.transferableExperience.length === 0
  ) {
    return false;
  }

  if (params.blockingGaps.length >= 4 && params.fit !== "partial") {
    return false;
  }

  return true;
}

import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyFitLevel,
  ResumeVacancyFitResult,
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
    score: normalizeScore(source.score, fit),
    confidence: normalizeConfidence(source.confidence),
    resumeRole: toNullableString(source.resumeRole),
    vacancyRole: toNullableString(source.vacancyRole),
    careerMove: toEnumValue(source.careerMove, careerMoves, "unknown"),
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
    riskFlags: normalizeRiskFlags(source.riskFlags),
  };
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

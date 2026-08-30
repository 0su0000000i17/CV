import type { ResumeVacancyFitResult } from "../types.js";
import { adaptationModes, careerMoves, fitLevels } from "./config.js";
import {
  isRecord,
  normalizeConfidence,
  normalizeForbiddenChanges,
  normalizeRiskFlags,
  toEnumValue,
  toNullableString,
  toStringArray,
} from "./normalize-helpers.js";
import { getBackendCanAdapt } from "./can-adapt.js";
import { normalizeFitScore } from "./fit-score.js";

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

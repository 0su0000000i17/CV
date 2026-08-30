import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyFitLevel,
} from "../types.js";

export function getBackendCanAdapt(params: {
  rawCanAdapt: unknown;
  fit: ResumeVacancyFitLevel;
  adaptationMode: ResumeVacancyAdaptationMode;
  matchedRequirements: string[];
  transferableExperience: string[];
  blockingGaps: string[];
}) {
  if (params.fit === "impossible" || params.adaptationMode === "blocked") return false;
  if (params.rawCanAdapt !== true) return false;
  if (
    params.fit === "weak" &&
    params.matchedRequirements.length === 0 &&
    params.transferableExperience.length === 0
  ) return false;
  return !(params.blockingGaps.length >= 4 && params.fit !== "partial");
}

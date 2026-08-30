import { getCandidateCriteria } from "../candidate-criteria.js";
import type { NormalizedVacancy, VacancySourceMetadata } from "../types.js";
import { createDeterministicVacancyFallback } from "./deterministic-fallback.js";

export function normalizeStructuredVacancyText(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): NormalizedVacancy | null {
  const vacancy = createDeterministicVacancyFallback(params);
  const criteria = getCandidateCriteria(vacancy);
  const actionableLines = vacancy.responsibilities.length
    + vacancy.requirements.length + vacancy.niceToHave.length + vacancy.skills.length;
  const hasEvidenceSections = vacancy.responsibilities.length > 0
    && (vacancy.requirements.length > 0 || vacancy.skills.length > 0);
  const sufficientlyStructured = (hasEvidenceSections && actionableLines >= 3)
    || criteria.length >= 3;
  if (!vacancy.isVacancy || !vacancy.title || !criteria.length || !sufficientlyStructured) {
    return null;
  }
  return {
    ...vacancy,
    candidateCriteria: criteria,
    warnings: [],
    confidence: 0.86,
  };
}

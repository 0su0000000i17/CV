import { estimateExperienceMonthsFromDateRanges } from "./experience-dates.js";
import { calculateDisclosureScore } from "./experience-expectations.js";
import {
  extractExperienceText,
  parseDeclaredExperienceMonths,
} from "./experience-text.js";
import type { ExperienceProfileDiagnostics } from "./types.js";
import { countBullets, countWords, normalizeText } from "./utils.js";

export function buildExperienceProfileDiagnostics(
  resumeMarkdown?: string
): ExperienceProfileDiagnostics | null {
  const normalized = normalizeText(resumeMarkdown || "");
  if (!normalized) return null;

  const experienceText = extractExperienceText(normalized);
  const declaredMonths = parseDeclaredExperienceMonths(normalized);
  const estimatedMonths = estimateExperienceMonthsFromDateRanges(experienceText);
  const totalExperienceMonths = declaredMonths ?? estimatedMonths;
  const experienceWords = countWords(experienceText);
  const bulletCount = countBullets(experienceText);
  const disclosure = calculateDisclosureScore({
    words: experienceWords,
    bullets: bulletCount,
    totalExperienceMonths,
  });

  return {
    totalExperienceMonths,
    experienceWords,
    bulletCount,
    expectedMinWords: disclosure.minWords,
    expectedMaxWords: disclosure.maxWords,
    expectedMinBullets: disclosure.minBullets,
    expectedMaxBullets: disclosure.maxBullets,
    disclosure: disclosure.disclosure,
    score: disclosure.score,
  };
}

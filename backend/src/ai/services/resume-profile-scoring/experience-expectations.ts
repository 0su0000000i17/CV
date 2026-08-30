import type { ExperienceProfileDiagnostics } from "./types.js";
import { clampScore } from "./utils.js";
import { getExperienceExpectations } from "./experience-ranges.js";

export function calculateDisclosureScore(params: {
  words: number;
  bullets: number;
  totalExperienceMonths: number | null;
}) {
  const expectations = getExperienceExpectations(params.totalExperienceMonths);
  let score = 86;
  let disclosure: ExperienceProfileDiagnostics["disclosure"] = "balanced";

  if (params.words < expectations.minWords) {
    const ratio = params.words / expectations.minWords;
    disclosure = "too_short";
    score = getTooShortScore(ratio, params.totalExperienceMonths);
  } else if (params.words > expectations.maxWords) {
    const ratio = params.words / expectations.maxWords;
    disclosure = "too_long";
    score = ratio > 1.5 ? 54 : ratio > 1.25 ? 62 : 70;
  }

  if (params.bullets > 0 && params.bullets < expectations.minBullets) {
    score = Math.min(score, (params.totalExperienceMonths || 0) >= 60 ? 58 : 66);
    disclosure = disclosure === "too_long" ? disclosure : "too_short";
  }

  if (params.bullets > expectations.maxBullets) {
    score = Math.min(score, 68);
    disclosure = "too_long";
  }

  return {
    ...expectations,
    disclosure,
    score: clampScore(applyBulletDensityPenalty(score, params)),
  };
}

function getTooShortScore(ratio: number, totalExperienceMonths: number | null) {
  if ((totalExperienceMonths || 0) >= 60 && ratio < 0.65) return 50;
  if (ratio < 0.55) return 48;
  if (ratio < 0.8) return 60;
  // Just under the norm shouldn't fall off a cliff: a 2% shortfall used to
  // cost the same 16 points as a 20% one.
  if (ratio < 0.9) return 70;
  return 78;
}

function applyBulletDensityPenalty(
  score: number,
  params: { words: number; bullets: number }
) {
  if (params.bullets <= 0) return score;

  const wordsPerBullet = params.words / params.bullets;
  if (wordsPerBullet < 9) return Math.min(score, 66);
  if (wordsPerBullet > 70) return Math.min(score, 72);

  return score;
}

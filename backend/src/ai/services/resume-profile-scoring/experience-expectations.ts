import type {
  ExperienceExpectations,
  ExperienceProfileDiagnostics,
} from "./types.js";
import { clampScore } from "./utils.js";

export function getExperienceExpectations(
  months: number | null
): ExperienceExpectations {
  if (months === null) {
    return {
      minWords: 260,
      targetWords: 520,
      maxWords: 1_100,
      minBullets: 4,
      maxBullets: 18,
    };
  }

  const years = months / 12;

  if (years < 1) {
    return {
      minWords: 120,
      targetWords: 240,
      maxWords: 520,
      minBullets: 2,
      maxBullets: 9,
    };
  }

  if (years < 3) {
    return {
      minWords: 220,
      targetWords: 430,
      maxWords: 850,
      minBullets: 4,
      maxBullets: 14,
    };
  }

  if (years < 5) {
    return {
      minWords: 340,
      targetWords: 650,
      maxWords: 1_200,
      minBullets: 6,
      maxBullets: 20,
    };
  }

  if (years < 8) {
    return {
      minWords: 480,
      targetWords: 850,
      maxWords: 1_550,
      minBullets: 8,
      maxBullets: 26,
    };
  }

  return {
    minWords: 620,
    targetWords: 1_050,
    maxWords: 1_900,
    minBullets: 10,
    maxBullets: 32,
  };
}

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
  return 70;
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

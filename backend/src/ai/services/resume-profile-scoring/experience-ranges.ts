import type { ExperienceExpectations } from "./types.js";

export function getExperienceExpectations(
  months: number | null
): ExperienceExpectations {
  if (months === null) {
    return { minWords: 260, targetWords: 520, maxWords: 1_100,
      minBullets: 4, maxBullets: 18 };
  }
  const years = months / 12;
  if (years < 1) {
    return { minWords: 120, targetWords: 240, maxWords: 520,
      minBullets: 2, maxBullets: 9 };
  }
  if (years < 3) {
    return { minWords: 220, targetWords: 430, maxWords: 850,
      minBullets: 4, maxBullets: 14 };
  }
  if (years < 5) {
    return { minWords: 340, targetWords: 650, maxWords: 1_200,
      minBullets: 6, maxBullets: 20 };
  }
  if (years < 8) {
    return { minWords: 480, targetWords: 850, maxWords: 1_550,
      minBullets: 8, maxBullets: 26 };
  }
  return { minWords: 620, targetWords: 1_050, maxWords: 1_900,
    minBullets: 10, maxBullets: 32 };
}

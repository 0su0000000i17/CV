import type { RedFlagSeverity } from "../../schemas/resume-analysis-schema.js";

export const qualityScores = {
  none: 8,
  weak: 25,
  partial: 48,
  solid: 70,
  strong: 88,
};

export const simpleQualityScores = {
  poor: 22,
  medium: 55,
  good: 82,
};

export const severityPenalty: Record<RedFlagSeverity, number> = {
  minor: 10,
  major: 22,
  critical: 38,
};

export const monthNames: Record<string, number> = {
  январ: 0,
  феврал: 1,
  март: 2,
  апрел: 3,
  ма: 4,
  июн: 5,
  июл: 6,
  август: 7,
  сентябр: 8,
  октябр: 9,
  ноябр: 10,
  декабр: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

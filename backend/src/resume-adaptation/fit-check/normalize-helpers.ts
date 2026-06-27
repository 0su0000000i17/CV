import type {
  ResumeVacancyFitLevel,
  ResumeVacancyFitRiskFlag,
} from "../types.js";
import { riskFlagSeverities, riskFlagTypes } from "./config.js";

const EMPTY_STRING_VALUES = new Set(["null", "undefined", "none", "n/a", "-"]);

export function normalizeForbiddenChanges(value: unknown) {
  const modelItems = toStringArray(value, 12);

  return Array.from(
    new Set([
      ...modelItems,
      "Не менять личные данные кандидата.",
      "Не добавлять неподтвержденные компании, должности, даты, проекты, технологии и метрики.",
      "Не повышать уровень кандидата без подтверждения в резюме.",
    ])
  );
}

export function normalizeRiskFlags(value: unknown): ResumeVacancyFitRiskFlag[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const explanation = toNullableString(item.explanation);
      if (!explanation) return null;

      return {
        type: toEnumValue(item.type, riskFlagTypes, "over_adaptation_risk"),
        severity: toEnumValue(item.severity, riskFlagSeverities, "minor"),
        explanation,
      };
    })
    .filter((item): item is ResumeVacancyFitRiskFlag => Boolean(item))
    .slice(0, 8);
}

export function normalizeScore(value: unknown, fit: ResumeVacancyFitLevel) {
  const fallbackByFit: Record<ResumeVacancyFitLevel, number> = {
    impossible: 10,
    weak: 35,
    partial: 55,
    solid: 75,
    strong: 90,
  };

  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallbackByFit[fit];
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export function toEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string") return fallback;
  return allowedValues.includes(value as T) ? (value as T) : fallback;
}

export function toNullableString(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || EMPTY_STRING_VALUES.has(trimmed.toLowerCase())) return null;

  return trimmed;
}

export function toStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => toNullableString(item) || "")
    .filter(Boolean)
    .slice(0, limit);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

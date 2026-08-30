import type { CoverLetterTone } from "../types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeCoverLetterResult(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid cover letter response");
  const coverLetter =
    typeof value.coverLetter === "string" ? value.coverLetter.trim() : "";
  if (!coverLetter) throw new Error("AI returned empty cover letter");
  const warnings = Array.isArray(value.warnings)
    ? value.warnings
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 500))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  return { coverLetter, warnings };
}

function removeLeadingGreeting(value: string) {
  return value
    .trim()
    .replace(/^здравствуйте[.!]?\s*/i, "")
    .replace(/^добрый\s+день[.!]?\s*/i, "")
    .trim();
}

function cleanupForbiddenTonePhrases(value: string, tone: CoverLetterTone) {
  if (tone !== "strict_professional" && tone !== "confident_short") return value;
  return value
    .replace(/я\s+уверен[а]?,?\s+что\s+/gi, "")
    .replace(/уверен[а]?,?\s+что\s+/gi, "")
    .replace(/спасибо\s+за\s+рассмотрение\s+моей\s+кандидатуры\.?/gi, "")
    .replace(/буду\s+рад[а]?\s+возможности\s+/gi, "Готов ")
    .replace(/буду\s+рад[а]?\s+обсудить/gi, "Готов обсудить")
    .replace(/мои\s+навыки\s+будут\s+полезны\s+вашей\s+команде\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeFinalCoverLetter(value: string, tone: CoverLetterTone) {
  const cleaned = cleanupForbiddenTonePhrases(removeLeadingGreeting(value), tone).trim();
  return `Здравствуйте.\n\n${cleaned}`;
}

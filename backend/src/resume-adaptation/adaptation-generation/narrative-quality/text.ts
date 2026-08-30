import type { NarrativeSourcePayload } from "./types.js";

export function normalizeNarrativeText(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function narrativeSimilarity(firstValue: string, secondValue: string) {
  const tokenize = (value: string) =>
    normalizeNarrativeText(value).split(" ").filter((token) => token.length > 2);
  const first = new Set(tokenize(firstValue));
  const second = new Set(tokenize(secondValue));
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / Math.max(first.size, second.size);
}

export function splitNarrativeSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function parseNarrativeSource(resumeJson: string): NarrativeSourcePayload {
  try {
    return JSON.parse(resumeJson) as NarrativeSourcePayload;
  } catch {
    return {};
  }
}

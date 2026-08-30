import {
  PLATFORM_METRIC_PATTERNS,
  PUBLICATION_META_PATTERNS,
  STANDALONE_NAVIGATION_PATTERNS,
  TAIL_SECTION_PATTERNS,
  UNIVERSAL_UI_NOISE_PATTERNS,
} from "./noise-patterns.js";

export function normalizeExtractedLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

export function normalizeLineForDedupe(line: string) {
  return line
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAlwaysNoiseLine(line: string) {
  return (
    UNIVERSAL_UI_NOISE_PATTERNS.some((pattern) => pattern.test(line)) ||
    STANDALONE_NAVIGATION_PATTERNS.some((pattern) => pattern.test(line)) ||
    PUBLICATION_META_PATTERNS.some((pattern) => pattern.test(line)) ||
    PLATFORM_METRIC_PATTERNS.some((pattern) => pattern.test(line))
  );
}

export function isTailSectionLine(line: string) {
  return TAIL_SECTION_PATTERNS.some((pattern) => pattern.test(line));
}

export function countMeaningfulChars(line: string) {
  return isAlwaysNoiseLine(line) || isTailSectionLine(line)
    ? 0
    : line.replace(/\s/g, "").length;
}

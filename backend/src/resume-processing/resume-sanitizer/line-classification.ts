import {
  ADDRESS_LINE_PATTERNS,
  CONTACT_LINE_PATTERNS,
  IMAGE_NOISE_LINE_PATTERNS,
  LOCATION_LINE_PATTERNS,
  PERSONAL_HEADER_PATTERNS,
} from "./patterns.js";

function hasEmail(line: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line);
}

function hasUrl(line: string) {
  return (
    /\b(?:https?:\/\/|www\.)[^\s<>"')\]}]+/i.test(line) ||
    /\b(?:[a-z0-9-]+\.)+(?:ru|com|org|net|io|co|dev|app|ai|su|рф)(?:\/[^\s<>"')\]}]*)?/i.test(line)
  );
}

function hasPhone(line: string) {
  return /(?:\+?\d[\s().-]*){9,}\d/.test(line);
}

function hasTelegram(line: string) {
  return /(^|\s)@[a-zA-Z0-9_]{4,32}\b/.test(line);
}

function matchesAny(line: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(line));
}

function isImageNoiseLine(line: string) {
  return matchesAny(line.trim(), IMAGE_NOISE_LINE_PATTERNS);
}

export function isLikelyFullNameLine(line: string, index: number) {
  const trimmedLine = line.trim();
  if (index > 6 || trimmedLine.includes("@") || /\d/.test(trimmedLine)) return false;
  const words = trimmedLine.split(/\s+/);
  return (
    words.length >= 2 &&
    words.length <= 4 &&
    words.every((word) => /^[А-ЯЁA-Z][а-яёa-z-]+$/.test(word))
  );
}

export function isResumeFooterLine(line: string) {
  return /резюме обновлено/i.test(line.trim());
}

export function isPersonalHeaderLine(line: string) {
  return matchesAny(line.trim(), PERSONAL_HEADER_PATTERNS);
}

export function isLikelyContactLine(line: string) {
  const trimmedLine = line.trim();
  if (!trimmedLine) return false;
  if (isImageNoiseLine(trimmedLine)) return true;
  if (
    hasEmail(trimmedLine) ||
    hasUrl(trimmedLine) ||
    hasPhone(trimmedLine) ||
    hasTelegram(trimmedLine)
  ) {
    return true;
  }
  if (matchesAny(trimmedLine, ADDRESS_LINE_PATTERNS)) return true;
  if (matchesAny(trimmedLine, LOCATION_LINE_PATTERNS)) return false;
  return matchesAny(trimmedLine, CONTACT_LINE_PATTERNS) && trimmedLine.length <= 180;
}

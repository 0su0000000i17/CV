import {
  MAX_EXTRACTED_TEXT_CHARS,
  MIN_EXTRACTED_TEXT_CHARS,
} from "../constants.js";
import type { PageExtractionStatus } from "../types.js";
import {
  BAD_PAGE_PATTERNS,
} from "./noise-patterns.js";
import {
  countMeaningfulChars,
  isAlwaysNoiseLine,
  isTailSectionLine,
  normalizeExtractedLine,
  normalizeLineForDedupe,
} from "./text-cleaning-helpers.js";

type CleanExtractedTextResult = {
  text: string;
  isTextLimited: boolean;
};

type ExtractedTextValidationResult =
  | {
      ok: true;
      confidence: number;
    }
  | {
      ok: false;
      status: PageExtractionStatus;
      message: string;
      confidence: number;
    };

export function cleanExtractedText(text: string): CleanExtractedTextResult {
  const rawLines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeExtractedLine(line))
    .filter(Boolean);

  const cleanedLines: string[] = [];
  const seenLines = new Set<string>();

  let meaningfulChars = 0;

  for (const line of rawLines) {
    const normalizedKey = normalizeLineForDedupe(line);

    if (!normalizedKey || seenLines.has(normalizedKey)) {
      continue;
    }

    if (isAlwaysNoiseLine(line)) {
      continue;
    }

    if (isTailSectionLine(line) && meaningfulChars >= 700) {
      break;
    }

    if (isTailSectionLine(line)) {
      continue;
    }

    seenLines.add(normalizedKey);
    cleanedLines.push(line);

    meaningfulChars += countMeaningfulChars(line);
  }

  const cleanedText = cleanedLines.join("\n").trim();

  if (cleanedText.length <= MAX_EXTRACTED_TEXT_CHARS) {
    return {
      text: cleanedText,
      isTextLimited: false,
    };
  }

  return {
    text: cleanedText.slice(0, MAX_EXTRACTED_TEXT_CHARS).trim(),
    isTextLimited: true,
  };
}

export function validateExtractedText(
  text: string
): ExtractedTextValidationResult {
  if (BAD_PAGE_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      ok: false,
      status: "captcha_or_bot_check",
      message:
        "Страница показала защиту или captcha. Вставьте текст вакансии вручную.",
      confidence: 0.05,
    };
  }

  const compactLength = text.replace(/\s/g, "").length;

  if (compactLength < MIN_EXTRACTED_TEXT_CHARS) {
    return {
      ok: false,
      status: "content_too_short",
      message:
        "Не удалось извлечь достаточно текста. Вставьте описание вакансии вручную.",
      confidence: 0.15,
    };
  }

  return {
    ok: true,
    confidence: Math.min(0.9, 0.45 + compactLength / 8000),
  };
}

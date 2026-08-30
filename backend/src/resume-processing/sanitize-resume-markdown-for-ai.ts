import {
  isLikelyContactLine,
  isLikelyFullNameLine,
  isPersonalHeaderLine,
  isResumeFooterLine,
} from "./resume-sanitizer/line-classification.js";
import {
  normalizeAfterSanitizing,
  redactInlineSensitiveData,
  removeImageAndBinaryNoise,
} from "./resume-sanitizer/redaction.js";

export function sanitizeResumeMarkdownForAi(markdown: string) {
  const lines = removeImageAndBinaryNoise(markdown).split(/\r?\n/);
  const cleanedLines = lines
    .map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return "";
      if (isLikelyFullNameLine(trimmedLine, index)) return "";
      if (isResumeFooterLine(trimmedLine)) return "";
      if (isPersonalHeaderLine(trimmedLine)) return "";
      if (isLikelyContactLine(trimmedLine)) return "";
      return redactInlineSensitiveData(trimmedLine);
    })
    .filter((line) => line.trim().length > 0);
  return normalizeAfterSanitizing(cleanedLines.join("\n"));
}

import type { SourceResumeDocument } from "../../types.js";
import {
  extractEmail,
  extractPhoneFromText,
  extractTelegram,
} from "./contact-values.js";
import { isAdditionalServiceLine, normalizeLine } from "./line-utils.js";

export function parseAdditionalParagraphs(markdown: string) {
  const lines = markdown.replace(/\r/gu, "\n").split("\n");
  const normalized = lines.map(normalizeLine);
  let start = normalized.findIndex((line) => /^Дополнительная информация$/iu.test(line));
  if (start < 0) start = normalized.findIndex((line) => /^Обо мне$/iu.test(line));
  if (start < 0) return [];
  const paragraphs: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const value = current.map(normalizeLine).filter(Boolean).join("\n");
    if (value) paragraphs.push(value);
    current = [];
  };
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = normalized[index];
    if (line && isAdditionalServiceLine(line)) {
      flush();
      continue;
    }
    if (/^Обо мне$/iu.test(line)) continue;
    if (!line) {
      flush();
      continue;
    }
    current.push(line.replace(/^Обо мне\s+/iu, ""));
  }
  flush();
  return paragraphs;
}

export function parseAdditionalSection(
  lines: string[],
  paragraphs: string[] = [],
): SourceResumeDocument["additional"] {
  const raw = [...lines];
  const about = paragraphs.length ? paragraphs : lines
    .map(normalizeLine)
    .filter((line) => Boolean(line) && line !== "Обо мне" && !isAdditionalServiceLine(line))
    .map((line) => line.replace(/^Обо мне\s+/iu, ""));
  const text = about.join("\n");
  const aboutLines = about.flatMap((paragraph) => paragraph.split("\n"));
  return {
    about,
    telegram: extractTelegram(aboutLines),
    phone: extractPhoneFromText(text),
    email: extractEmail(text),
    raw,
  };
}

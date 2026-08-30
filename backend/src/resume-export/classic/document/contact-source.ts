import type { SourceResumeDocument } from "../../../resume-document/types.js";
import { cleanText, uniqueStrings } from "../text.js";

function lineKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

export function sourceContactLines(document: SourceResumeDocument | null) {
  return uniqueStrings(document?.personal.contactLines ?? []);
}

export function sourceContactLineGaps(document: SourceResumeDocument | null) {
  const lines = document?.personal.contactLines ?? [];
  const gaps = document?.personal.contactLineGaps ?? [];
  if (!lines.length || !gaps.length) return [];
  const seen = new Set<string>();
  const result: boolean[] = [];
  lines.forEach((line, index) => {
    const key = lineKey(line);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(Boolean(gaps[index]));
  });
  return result;
}

function isExtraContactLine(value: string) {
  const text = cleanText(value);
  return Boolean(text) && (
    /^(?:whatsapp|github|gitlab|linkedin|другой сайт|мой блог|мой вк|сайт|портфолио)\s*:/iu.test(text) ||
    /https?:\/\//iu.test(text)
  );
}

function representedByBaseContact(line: string, baseLines: string[]) {
  const value = cleanText(line);
  if (!value || baseLines.some((item) => lineKey(item) === lineKey(value))) return true;
  const digits = value.replace(/\D/gu, "");
  if (digits.length >= 10 && !isExtraContactLine(value)) return true;
  if (value.includes("@") && !/^(?:telegram|телеграм|tg)\s*:/iu.test(value) &&
    !isExtraContactLine(value)) return true;
  if (/^(?:Мужчина|Женщина)(?:\s|,|$)/iu.test(value)) return true;
  if (/^(?:Проживает|Гражданство|Готов[а]?|Не готов[а]?)(?:\s|:|,|$)/iu.test(value)) return true;
  if (/^(?:telegram|телеграм|tg)\s*:/iu.test(value)) return true;
  return /^[-—–]\s*предпочитаемый способ связи$/iu.test(value);
}

export function extraContactLines(
  document: SourceResumeDocument | null,
  baseLines: string[],
) {
  return sourceContactLines(document)
    .filter(isExtraContactLine)
    .filter((line) => !representedByBaseContact(line, baseLines));
}

export function sameContactLines(first: string[], second: string[]) {
  return first.length === second.length &&
    first.every((line, index) => lineKey(line) === lineKey(second[index] ?? ""));
}

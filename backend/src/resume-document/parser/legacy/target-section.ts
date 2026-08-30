import type { SourceResumeDocument } from "../../types.js";
import { escapeRegExp, normalizeLine, normalizeTextValue } from "./line-utils.js";

function isTargetLabelLine(line: string) {
  return /:$/u.test(line) ||
    /^(Тип занятости|Занятость|График работы|Формат работы|Желательное время)/iu.test(line);
}

function extractTargetValue(lines: string[], labels: string[]) {
  for (const line of lines.map(normalizeLine)) {
    const label = labels.find((item) =>
      new RegExp(`^${escapeRegExp(item)}:\\s*`, "iu").test(line),
    );
    if (label) {
      return normalizeTextValue(
        line.replace(new RegExp(`^${escapeRegExp(label)}:\\s*`, "iu"), ""),
      );
    }
  }
  return null;
}

function extractSpecializations(lines: string[]) {
  const result: string[] = [];
  const index = lines.findIndex((line) => line === "Специализации:");
  if (index < 0) return result;
  for (const line of lines.slice(index + 1)) {
    if (!line.startsWith("—") && !line.startsWith("-")) break;
    result.push(line.replace(/^[-—]\s*/u, ""));
  }
  return result;
}

export function parseTargetSection(lines: string[]): SourceResumeDocument["target"] {
  const specializationsIndex = lines.findIndex((line) => line === "Специализации:");
  const title = lines
    .slice(0, specializationsIndex >= 0 ? specializationsIndex : lines.length)
    .find((line) => !isTargetLabelLine(line)) ?? null;
  return {
    title: title?.replace(/\s*[,—-]?\s*\d[\d\s]*(?:₽|руб\.?|RUB).*$/iu, "").trim() || null,
    salary: normalizeTextValue(lines.find((line) => /\d[\d\s]*(?:₽|руб\.?|RUB)/iu.test(line))),
    specializations: extractSpecializations(lines),
    employment: extractTargetValue(lines, ["Тип занятости"]) ||
      extractTargetValue(lines, ["Занятость"]),
    schedule: extractTargetValue(lines, ["График работы"]),
    workFormat: extractTargetValue(lines, ["Формат работы"]),
    commuteTime: extractTargetValue(lines, ["Желательное время"]),
    raw: [...lines],
  };
}

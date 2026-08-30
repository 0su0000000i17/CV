import type { PdfLayoutDocument, PdfLayoutLine } from "../../resume-processing/pdf-layout/types.js";
import { cleanLayoutText, pageWidth, visualLines } from "./layout-utils.js";

const targetHeading = /^Желаемая должность и зарплата$/iu;
const experienceHeading = /^Опыт работы(?:\s+[—–-].*)?$/iu;
const specializationsHeading = /^Специализации:?$/iu;
const targetFieldPattern = /^(?:Тип занятости|Занятость|График работы|Формат работы|Желательное время)[^:]*:/iu;

function targetLines(layout: PdfLayoutDocument) {
  const lines = visualLines(layout);
  const start = lines.findIndex((line) => targetHeading.test(cleanLayoutText(line.text)));
  if (start < 0) return [];
  const offset = lines.slice(start + 1)
    .findIndex((line) => experienceHeading.test(cleanLayoutText(line.text)));
  return lines.slice(start + 1, offset >= 0 ? start + 1 + offset : lines.length);
}

export function layoutTargetTitle(layout: PdfLayoutDocument) {
  const lines = targetLines(layout);
  const specialization = lines.findIndex((line) =>
    specializationsHeading.test(cleanLayoutText(line.text)));
  const candidates = lines.slice(0, specialization >= 0 ? specialization : lines.length)
    .filter((line) => {
      const text = cleanLayoutText(line.text);
      return text && line.x < pageWidth(layout, line.page) * 0.65
        && !/^\d[\d\s]*$/u.test(text) && !/[₽€$]/u.test(text)
        && (line.bold || line.size >= 11);
    }).sort((first, second) => first.page - second.page || first.y - second.y
      || second.size - first.size);
  return cleanLayoutText(candidates[0]?.text) || null;
}

function nearSameRow(left: PdfLayoutLine, right: PdfLayoutLine) {
  return left.page === right.page && Math.abs(left.y - right.y) <= 12;
}

export function layoutSalary(layout: PdfLayoutDocument) {
  const lines = targetLines(layout);
  const amount = lines.find((line) => /^\d[\d\s]*(?:[.,]\d+)?$/u.test(cleanLayoutText(line.text))
    && line.x >= pageWidth(layout, line.page) * 0.55);
  if (!amount) {
    return cleanLayoutText(lines.find((line) =>
      /\d[\d\s]*(?:₽|руб\.?|RUB)/iu.test(cleanLayoutText(line.text)))?.text) || null;
  }
  const suffix = lines.find((line) => line.id !== amount.id && nearSameRow(amount, line)
    && /(?:₽|руб\.?|RUB)/iu.test(cleanLayoutText(line.text)));
  return cleanLayoutText([amount.text, suffix?.text].filter(Boolean).join(" ")) || null;
}

export function layoutTargetValue(layout: PdfLayoutDocument, label: RegExp) {
  const lines = targetLines(layout);
  const index = lines.findIndex((line) => label.test(cleanLayoutText(line.text)));
  if (index < 0) return null;
  const first = cleanLayoutText(lines[index]?.text);
  const values = [cleanLayoutText(first.replace(/^.*?:\s*/u, ""))].filter(Boolean);
  const origin = lines[index];
  for (const line of lines.slice(index + 1)) {
    const text = cleanLayoutText(line.text);
    if (!text || targetFieldPattern.test(text) || specializationsHeading.test(text)) break;
    if (!origin || line.page !== origin.page || Math.abs(line.x - origin.x) > 24) break;
    if (line.bold || /(?:₽|руб\.?|RUB)/iu.test(text)) break;
    values.push(text);
  }
  return cleanLayoutText(values.join(" ")) || null;
}

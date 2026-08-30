import type { PdfLayoutDocument, PdfLayoutLine } from "../../resume-processing/pdf-layout/types.js";
import type { SourceResumeDocument } from "../types.js";
import { cleanLayoutText, layoutTextKey, verticalGap, visualLines } from "./layout-utils.js";

const targetHeading = /^Желаемая должность и зарплата$/iu;

function isContactBoundary(value: string) {
  const line = cleanLayoutText(value);
  const digits = line.replace(/\D/gu, "");
  const phone = digits.length >= 10 && digits.length <= 15 && /^\+?\d/u.test(line);
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu.test(line);
  const url = /https?:\/\/|(?:^|\s)(?:www\.)?[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/|$)/iu.test(line);
  return /^(?:Мужчина|Женщина)(?:\s|,|$)/iu.test(line) || phone || email || url
    || /^(?:Проживает|Гражданство|Telegram|Телеграм|TG|WhatsApp|GitHub|GitLab|LinkedIn|Другой сайт|Мой блог|Мой вк|Сайт|Портфолио|Готов[а]?|Не готов[а]?)(?:\s|:|,|$)/iu.test(line)
    || /^[-—–]\s*предпочитаемый способ связи$/iu.test(line);
}

export function getHeaderContacts(
  layout: PdfLayoutDocument,
  document: SourceResumeDocument,
) {
  const lines = visualLines(layout);
  const targetIndex = lines.findIndex((line) => targetHeading.test(cleanLayoutText(line.text)));
  const header = lines.slice(0, targetIndex >= 0 ? targetIndex : lines.length);
  const fullNameKey = layoutTextKey(document.personal.fullName ?? "");
  const contactLines: string[] = [];
  const contactLineGaps: boolean[] = [];
  const seen = new Set<string>();
  let previous: PdfLayoutLine | null = null;
  let seenContact = false;
  for (const line of header) {
    const text = cleanLayoutText(line.text);
    const key = layoutTextKey(text);
    if (!text || /^(?:hh|hh\.ru|HeadHunter)$/iu.test(text)) continue;
    const isNamePart = Boolean(fullNameKey && key && fullNameKey.includes(key)
      && !isContactBoundary(text));
    if (isNamePart || (!seenContact && !isContactBoundary(text))) {
      previous = line;
      continue;
    }
    seenContact = true;
    if (!seen.has(key)) {
      seen.add(key);
      contactLines.push(text);
      contactLineGaps.push(verticalGap(previous, line) > 8);
    }
    previous = line;
  }
  return { contactLines, contactLineGaps };
}

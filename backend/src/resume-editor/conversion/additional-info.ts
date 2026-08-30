import type { SourceResumeDocument } from "../../resume-document/types.js";
import {
  looksLikeUrl,
  normalizeBulletPrefix,
  text,
  textKey,
  uniquePreserve,
} from "./text.js";

function isAboutDuplicate(line: string, aboutText: string) {
  const key = textKey(line);
  return key.length > 12 && textKey(aboutText).includes(key);
}

function isListItemLine(line: string) {
  const stripped = normalizeBulletPrefix(line);
  return stripped.length > 1 && stripped.length <= 40 && stripped.split(/\s+/u).length <= 4;
}

function isServiceLine(value: string) {
  return /резюме\s+обновлено|предпочитаемый\s+способ\s+связи/iu.test(value);
}

type PendingList = { header: string | null; items: string[] };

function flushList(result: string[], pending: PendingList) {
  if (pending.header) {
    result.push(pending.items.length
      ? `${pending.header.replace(/:\s*$/u, "")}: ${pending.items.join(", ")}`
      : pending.header);
  }
  pending.header = null;
  pending.items = [];
}

function collectLine(result: string[], pending: PendingList, line: string) {
  if (/^\W*портфолио\W*$/iu.test(line)) {
    flushList(result, pending);
    pending.header = "Портфолио";
    return;
  }
  if (pending.header === "Портфолио") {
    const candidate = normalizeBulletPrefix(line);
    if (looksLikeUrl(candidate)) {
      pending.items.push(candidate);
      flushList(result, pending);
      return;
    }
    flushList(result, pending);
  }
  if (/:\s*$/u.test(line)) {
    flushList(result, pending);
    pending.header = line;
    return;
  }
  if (pending.header && isListItemLine(line)) {
    pending.items.push(normalizeBulletPrefix(line));
    return;
  }
  flushList(result, pending);
  if (/^[•·]\s*\S+$/u.test(line)) return;
  const last = result[result.length - 1];
  const wrapsPrevious = Boolean(last) && !/[.!?:;…]$/u.test(last) && !looksLikeUrl(last);
  if (wrapsPrevious && !looksLikeUrl(line)) {
    result[result.length - 1] = `${last} ${line}`;
    return;
  }
  result.push(line);
}

export function buildAdditionalInfo(document: SourceResumeDocument) {
  if (document.additional.structuredItems !== undefined) {
    return document.additional.structuredItems;
  }
  const aboutText = document.additional.about.join(" ");
  const rawLines = document.additional.raw.map(text).filter(Boolean)
    .filter((line) => !isServiceLine(line))
    .filter((line) => !/^обо мне$/iu.test(line));
  const result: string[] = [];
  const pending: PendingList = { header: null, items: [] };
  for (const line of rawLines) collectLine(result, pending, line);
  flushList(result, pending);
  return uniquePreserve(result)
    .filter((item) => !isAboutDuplicate(item, aboutText))
    .slice(0, 12);
}

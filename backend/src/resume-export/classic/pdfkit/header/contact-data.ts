import type { ClassicDocument } from "../../types.js";
import { clean, readImageSize } from "../helpers.js";
import { layout } from "../layout.js";

const fakeTelegramHandles = new Set([
  "yandex", "ya", "mail", "gmail", "bk", "inbox", "rambler", "email",
]);

function parseTelegramHandle(value: string) {
  return clean(value).match(/^telegram:\s*@?([a-z0-9_.-]+)$/iu)?.[1] || null;
}

function isFakeTelegram(value: string) {
  const handle = parseTelegramHandle(value);
  return Boolean(handle && fakeTelegramHandles.has(handle.toLowerCase()));
}

function sourceTelegram(sourceText: string) {
  const match = sourceText.match(/(?:^|\n)\s*telegram:\s*@?([a-z0-9_.-]+)/iu);
  const handle = match?.[1] ? clean(match[1]) : "";
  if (!handle || fakeTelegramHandles.has(handle.toLowerCase())) return null;
  return `telegram: @${handle}`;
}

function sentenceCaseContact(value: string) {
  const text = clean(value);
  if (!text || text.includes("@") || text.toLowerCase().startsWith("telegram:")) {
    return text;
  }
  return text[0] ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

export function contactEntries(doc: ClassicDocument) {
  const entries = doc.contactLines
    .map((line, index) => ({ line, gapBefore: Boolean(doc.contactLineGaps?.[index]) }))
    .filter((entry) => !isFakeTelegram(entry.line))
    .map((entry) => ({ ...entry, line: sentenceCaseContact(entry.line) }));
  const telegram = sourceTelegram(doc.sourceText);
  if (!telegram || entries.some((entry) => parseTelegramHandle(entry.line))) return entries;
  const emailIndex = entries.findIndex(
    (entry) => entry.line.includes("@") &&
      !entry.line.toLowerCase().startsWith("telegram:")
  );
  const telegramEntry = { line: telegram, gapBefore: false };
  if (emailIndex < 0) return [...entries, telegramEntry];
  return [
    ...entries.slice(0, emailIndex + 1),
    telegramEntry,
    ...entries.slice(emailIndex + 1),
  ];
}

export function photoDimensions(doc: ClassicDocument, photo: Buffer | null) {
  const sourceSize = doc.photoSize || (photo ? readImageSize(photo) : null);
  const rawWidth = sourceSize?.width || 0;
  const rawHeight = sourceSize?.height || 0;
  const ratio = rawWidth > 0 && rawHeight > 0 ? rawHeight / rawWidth : 1.22;
  const maxHeight = 95;
  const width = Math.min(layout.photoWidth, maxHeight / ratio);
  return { width, height: width * ratio };
}

import type { ClassicDocument } from "../types.js";
import { layout, typography } from "./layout.js";
import type { PdfWriter } from "./writer.js";
import { clean, parseDataImage } from "./helpers.js";
import { colors } from "./layout.js";

const fakeTelegramHandles = new Set([
  "yandex",
  "ya",
  "mail",
  "gmail",
  "bk",
  "inbox",
  "rambler",
  "email",
]);

function parseTelegramHandle(value: string) {
  const match = clean(value).match(/^telegram:\s*@?([a-z0-9_.-]+)$/iu);
  return match?.[1] || null;
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

function contactLines(doc: ClassicDocument) {
  const lines = doc.contactLines.filter((line) => !isFakeTelegram(line));
  const telegram = sourceTelegram(doc.sourceText);
  if (!telegram || lines.some((line) => parseTelegramHandle(line))) return lines;

  const emailIndex = lines.findIndex((line) => /@/.test(line) && !/^telegram:/iu.test(line));
  if (emailIndex < 0) return [...lines, telegram];

  return [...lines.slice(0, emailIndex + 1), telegram, ...lines.slice(emailIndex + 1)];
}

function photoDimensions(doc: ClassicDocument) {
  const rawWidth = doc.photoSize?.width || 0;
  const rawHeight = doc.photoSize?.height || 0;
  const ratio = rawWidth > 0 && rawHeight > 0 ? rawHeight / rawWidth : 1.22;
  const width = layout.photoWidth;
  const height = Math.min(width * ratio, 95);

  return { width, height };
}

export function renderHeader(writer: PdfWriter, doc: ClassicDocument) {
  const photo = parseDataImage(doc.photoUrl);
  const { width: photoWidth, height: photoHeight } = photoDimensions(doc);
  const hasPhoto = Boolean(photo && photoWidth > 35 && photoHeight > 35);
  const contentX = hasPhoto ? writer.left + photoWidth + layout.photoGap : writer.left;
  const contentWidth = writer.right - contentX;
  const top = writer.y;

  if (photo) writer.image(photo, writer.left, top, { width: photoWidth, height: photoHeight });

  let y = top - (hasPhoto ? 3.75 : 0);
  y += writer.textAt(doc.name, contentX, y, contentWidth, {
    font: "bold",
    size: typography.name,
    color: colors.black,
  }) + 1.5;

  for (const line of contactLines(doc)) {
    if (line.startsWith("Проживает:")) y += 12;
    y += writer.textAt(line, contentX, y, contentWidth, {
      size: typography.body,
      color: colors.text,
      lineGap: 0.2,
    }) + 0.75;
  }

  writer.y = Math.max(y, top + (hasPhoto ? photoHeight : 0)) + 22;
}

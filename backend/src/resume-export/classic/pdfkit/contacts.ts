import type { ClassicDocument } from "../types.js";
import { layout, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";
import { clean, parseDataImage } from "./helpers.js";
import { colors } from "./layout.js";

const contactStyle: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const mutedContactStyle: TextStyle = { size: typography.body, color: colors.muted, lineGap: 0.2 };

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

function sentenceCaseContact(value: string) {
  const text = clean(value);
  if (!text || text.includes("@") || text.toLowerCase().startsWith("telegram:")) return text;
  return text[0] ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

function contactLines(doc: ClassicDocument) {
  const lines = doc.contactLines.filter((line) => !isFakeTelegram(line)).map(sentenceCaseContact);
  const telegram = sourceTelegram(doc.sourceText);
  if (!telegram || lines.some((line) => parseTelegramHandle(line))) return lines;

  const emailIndex = lines.findIndex((line) => line.includes("@") && !line.toLowerCase().startsWith("telegram:"));
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

function renderContactLine(writer: PdfWriter, line: string, x: number, y: number, width: number) {
  const marker = " — ";
  const markerIndex = line.indexOf(marker);
  if (markerIndex < 0) {
    return writer.textAt(line, x, y, width, contactStyle);
  }

  const main = line.slice(0, markerIndex);
  const suffix = line.slice(markerIndex);
  const fullHeight = writer.measure(line, width, contactStyle);

  writer.setFont(contactStyle);
  writer.doc.text(main, x, y, { width, lineBreak: false });
  const mainWidth = writer.doc.widthOfString(main);

  writer.setFont(mutedContactStyle);
  writer.doc.text(suffix, x + mainWidth, y, {
    width: Math.max(0, width - mainWidth),
    lineBreak: false,
  });

  return fullHeight;
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
    y += renderContactLine(writer, line, contentX, y, contentWidth) + 0.75;
  }

  writer.y = Math.max(y, top + (hasPhoto ? photoHeight : 0)) + 22;
}

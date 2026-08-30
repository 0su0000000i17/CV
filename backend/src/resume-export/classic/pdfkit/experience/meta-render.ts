import { clean, looksLikeUrl } from "../helpers.js";
import { colors, typography } from "../layout.js";
import type { PdfWriter, TextStyle } from "../writer.js";
import { bareExperienceValue, experienceMetaColor, isCity } from "./value-helpers.js";

const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/[^\s,]*)?/giu;

function shouldBulletMeta(value: string, index: number, meta: string[]) {
  const text = bareExperienceValue(value);
  if (!text || value.trim().startsWith("•") || looksLikeUrl(text) || isCity(text)) return false;
  if (text.includes(":")) return false;
  const previous = bareExperienceValue(meta[index - 1] || "");
  return Boolean(index > 0 && previous && !looksLikeUrl(previous)
    && !isCity(previous) && !previous.includes(","));
}

export function displayMetaText(value: string, index: number, meta: string[]) {
  const text = clean(value);
  return shouldBulletMeta(text, index, meta) ? `• ${bareExperienceValue(text)}` : text;
}

function urlFragments(value: string) {
  return Array.from(clean(value).matchAll(urlPattern))
    .filter((match) => looksLikeUrl(match[0]));
}

export function renderMetaLine(
  writer: PdfWriter,
  text: string,
  x: number,
  y: number,
  width: number,
) {
  const value = clean(text);
  const matches = urlFragments(value);
  const fallback: TextStyle = {
    size: typography.meta,
    color: experienceMetaColor(value),
    lineGap: 0,
  };
  if (!matches.length || writer.doc.widthOfString(value) > width) {
    return writer.textAt(value, x, y, width, fallback);
  }
  const height = writer.measure(value, width, fallback);
  let cursor = 0;
  let currentX = x;
  for (const match of matches) {
    const index = match.index ?? 0;
    const before = value.slice(cursor, index);
    if (before) {
      writer.setFont(fallback);
      writer.doc.text(before, currentX, y, { lineBreak: false });
      currentX += writer.doc.widthOfString(before);
    }
    const url = match[0];
    writer.setFont({ size: typography.meta, color: colors.lightMuted, lineGap: 0 });
    writer.doc.text(url, currentX, y, { lineBreak: false });
    currentX += writer.doc.widthOfString(url);
    cursor = index + url.length;
  }
  const tail = value.slice(cursor);
  if (tail) {
    writer.setFont(fallback);
    writer.doc.text(tail, currentX, y, { lineBreak: false });
  }
  return height;
}

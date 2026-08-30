import { cleanText, stripBullet } from "../text.js";

export function clean(value?: string | null) {
  return cleanText(value);
}

function isRoleOnlyLine(value: string) {
  const text = clean(value).replace(/^[-•]\s*/u, "");
  if (!text || text.includes(":")) return false;

  return /(?:^|[\s\-‑–—\/])(разработчик|developer|engineer|программист|аналитик|дизайнер|менеджер|специалист|редактор)(?:\s|$)/iu.test(text);
}

export function textKey(value: string) {
  const text = clean(value);
  if (isRoleOnlyLine(text)) return "";

  return text.toLowerCase().replace(/[^a-zа-яё0-9]+/giu, "");
}

export function uniqueLines(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values.map((item) => clean(stripBullet(item))).filter(Boolean)) {
    const key = textKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

const urlTlds = new Set([
  "ru",
  "рф",
  "com",
  "org",
  "net",
  "io",
  "ai",
  "co",
  "me",
  "info",
  "biz",
  "app",
  "dev",
  "site",
  "online",
  "pro",
]);

export function looksLikeUrl(value: string) {
  const text = value.trim();
  if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) return true;

  const match = text.match(/^[a-zа-яё0-9][a-zа-яё0-9.-]*\.([a-zа-яё]{2,})(?:\/.*)?$/iu);
  if (!match?.[1]) return false;

  return urlTlds.has(match[1].toLowerCase());
}

export function parseDataImage(value?: string | null) {
  // pdfkit's image loader only understands PNG/JPEG - it throws on anything
  // else (webp included), which previously crashed the export (500) after
  // this check had already accepted the photo as valid.
  const match = clean(value).match(/^data:image\/(?:png|jpeg|jpg);base64,([a-z0-9+/=\r\n]+)$/iu);
  if (!match?.[1]) return null;

  try {
    return Buffer.from(match[1].replace(/\s+/g, ""), "base64");
  } catch {
    return null;
  }
}

export function readImageSize(buffer: Buffer) {
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer.toString("ascii", 1, 4) === "PNG"
  ) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1] ?? 0;
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + length + 2 > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return width > 0 && height > 0 ? { width, height } : null;
    }
    offset += length + 2;
  }
  return null;
}

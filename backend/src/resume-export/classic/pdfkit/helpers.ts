import { cleanText, stripBullet } from "../text.js";

export function clean(value?: string | null) {
  return cleanText(value);
}

export function textKey(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9]+/giu, "");
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

export function looksLikeUrl(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(text);
}

export function parseDataImage(value?: string | null) {
  const match = clean(value).match(/^data:image\/(?:png|jpeg|jpg|webp);base64,([a-z0-9+/=\r\n]+)$/iu);
  if (!match?.[1]) return null;

  try {
    return Buffer.from(match[1].replace(/\s+/g, ""), "base64");
  } catch {
    return null;
  }
}

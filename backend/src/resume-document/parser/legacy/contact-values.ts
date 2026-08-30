import { escapeRegExp, normalizeTextValue } from "./line-utils.js";

export function hasPhone(line: string) {
  const digits = line.replace(/\D/gu, "");
  return digits.length >= 10 && digits.length <= 15 && /^\+?\d/u.test(line);
}

export function cleanPhoneLine(line: string) {
  return line.replace(/—.*$/u, "").replace(/предпочитаемый способ связи/giu, "").trim() || null;
}

export function extractPhoneFromText(text: string) {
  return text.match(/(?:\+\d{1,3}|8)[\s(]*\d{1,4}[\s)]*\d{3}[-\s]?\d{2,4}[-\s]?\d{0,4}/u)?.[0]?.trim() ?? null;
}

export function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu)?.[0] ?? null;
}

export function extractTelegram(lines: string[]) {
  const text = lines.join("\n");
  const tMe = text.match(/(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]{3,32})/iu);
  if (tMe?.[1]) return `@${tMe[1]}`;
  const handle = text.match(/(?:^|[\s:(])@([a-zA-Z0-9_]{3,32})\b/mu);
  return handle?.[1] ? `@${handle[1]}` : null;
}

export function detectPreferredContact(params: {
  preferredContactRaw: string | null;
  phone: string | null;
  email: string | null;
  telegram: string | null;
}) {
  const lower = params.preferredContactRaw?.toLowerCase() ?? "";
  if (lower.includes("telegram") || lower.includes("телеграм")) return "telegram";
  if (lower.includes("whatsapp")) return "whatsapp";
  if (params.email && lower.includes(params.email.toLowerCase())) return "email";
  const rawDigits = lower.replace(/\D/gu, "");
  const phoneDigits = params.phone?.replace(/\D/gu, "") ?? "";
  if (phoneDigits && rawDigits.includes(phoneDigits)) return "phone";
  if (params.phone) return "phone";
  if (params.email) return "email";
  if (params.telegram) return "telegram";
  return lower ? "unknown" : null;
}

export function extractLineValue(text: string, label: string) {
  const match = text.match(new RegExp(`${escapeRegExp(label)}:\\s*([^\\n]+)`, "iu"));
  return normalizeTextValue(match?.[1]);
}

export function extractCitizenship(text: string) {
  const value = text.match(/Гражданство:\s*([^\n]+)/iu)?.[1];
  return normalizeTextValue(value?.replace(/,?\s*(?:есть\s+)?разрешение на работу:.*$/iu, ""));
}

export function extractWorkPermit(text: string) {
  return normalizeTextValue(text.match(/разрешение на работу:\s*([^\n]+)/iu)?.[1]);
}

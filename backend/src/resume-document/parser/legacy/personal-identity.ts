import { extractEmail, hasPhone } from "./contact-values.js";
import { normalizeLine, normalizeTextValue, textKey, uniqueStrings } from "./line-utils.js";
import { hasUrl } from "./url-utils.js";

function isPersonalHeaderBoundary(line: string) {
  return /^(?:Мужчина|Женщина)(?:\s|,|$)/iu.test(line) ||
    hasPhone(line) || Boolean(extractEmail(line)) ||
    /^(?:Проживает|Гражданство|Telegram|Телеграм|TG|WhatsApp|GitHub|GitLab|LinkedIn|Другой сайт|Мой блог|Мой вк|Сайт|Портфолио|Готов[а]?|Не готов[а]?)(?:\s|:|,|$)/iu.test(line) ||
    hasUrl(line) || /^[-—–]\s*предпочитаемый способ связи$/iu.test(line);
}

export function extractFullName(lines: string[]) {
  const normalized = lines.map(normalizeLine).filter(Boolean);
  const namePattern = /^[А-ЯЁA-Z][а-яёa-z-]+(?:\s+[А-ЯЁA-Z][а-яёa-z-]+){0,3}$/u;
  const boundary = normalized.findIndex(isPersonalHeaderBoundary);
  const header = normalized.slice(0, boundary >= 0 ? boundary : normalized.length);
  let trailing: string[] = [];
  for (const line of header) trailing = namePattern.test(line) ? [...trailing, line] : [];
  const combined = trailing.join(" ");
  const count = combined.split(/\s+/u).filter(Boolean).length;
  if (count >= 2 && count <= 4) return combined;
  for (const line of normalized) {
    const lineCount = line.split(/\s+/u).length;
    if (lineCount >= 2 && lineCount <= 4 && namePattern.test(line)) return line;
  }
  const first = normalized[0] ?? "";
  return /^[А-ЯЁA-Z][а-яёa-z-]+$/u.test(first) ? first : null;
}

export function extractHeaderContactLines(lines: string[], fullName: string | null) {
  const fullNameKey = textKey(fullName ?? "");
  const result: string[] = [];
  let seenContact = false;
  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) continue;
    const lineKey = textKey(line);
    const namePart = Boolean(
      fullNameKey && lineKey && fullNameKey.includes(lineKey) && !isPersonalHeaderBoundary(line),
    );
    if (namePart) continue;
    if (isPersonalHeaderBoundary(line) || seenContact) {
      seenContact = true;
      result.push(line);
    }
  }
  return uniqueStrings(result);
}

export function extractGenderAgeBirthDate(line: string | null) {
  const match = line?.match(/^(Мужчина|Женщина)(?:,\s*([^,]+))?(?:,\s*родил(?:ся|ась)\s+(.+))?/iu);
  return {
    gender: normalizeTextValue(match?.[1]),
    age: normalizeTextValue(match?.[2]),
    birthDate: normalizeTextValue(match?.[3]),
  };
}

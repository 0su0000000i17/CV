export function normalizePdfText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFC")
    .replace(/[\u00a0\u2007\u202f]/gu, " ")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\ufe58\ufe63\uff0d]/gu, "-")
    .replace(/[\u200b\u2060\ufeff]/gu, "");
}

export function cleanText(value: string | null | undefined) {
  return normalizePdfText(value)
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toTextLines(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean);
}

export function uniqueStrings(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const value = cleanText(item);
    const key = value.toLowerCase();

    if (!value || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}

export function stripBullet(value: string) {
  return cleanText(value).replace(/^[-—–•*]+\s*/u, "");
}

const dateMonthPattern =
  "январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря";
const datePointPattern = `(?:${dateMonthPattern})\\s+\\d{4}|настоящее\\s+время|по\\s+настоящее\\s+время|сейчас`;
const dateRangeLinePattern = new RegExp(
  `^(${datePointPattern})\\s*[-—–]\\s*(${datePointPattern})$`,
  "iu"
);

function splitDateRangeLine(value: string) {
  const line = cleanText(value);
  const match = line.match(dateRangeLinePattern);

  if (!match?.[1] || !match[2]) return [line].filter(Boolean);

  return [`${cleanText(match[1])} —`, cleanText(match[2])];
}

export function splitDateLines(value: string | null | undefined) {
  const explicitLines = normalizePdfText(value)
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean);

  if (explicitLines.length > 1) {
    return explicitLines.flatMap(splitDateRangeLine);
  }

  const text = explicitLines[0] ?? "";

  if (!text) return [];

  return text
    .split(/\s(?=\d+\s+(?:год|года|лет|месяц|месяца|месяцев)\b)/u)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .flatMap(splitDateRangeLine);
}

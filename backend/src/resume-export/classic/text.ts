export function cleanText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\u00a0/g, " ")
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

export function escapeHtml(value: string | null | undefined) {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

export function splitDateLines(value: string | null | undefined) {
  const text = cleanText(value);

  if (!text) return [];

  return text
    .split(/\s(?=\d+\s+(?:год|года|лет|месяц|месяца|месяцев)\b)/u)
    .map((line) => cleanText(line))
    .filter(Boolean);
}

const monthIndexes: Record<string, number> = {
  январь: 0,
  января: 0,
  февраль: 1,
  февраля: 1,
  март: 2,
  марта: 2,
  апрель: 3,
  апреля: 3,
  май: 4,
  мая: 4,
  июнь: 5,
  июня: 5,
  июль: 6,
  июля: 6,
  август: 7,
  августа: 7,
  сентябрь: 8,
  сентября: 8,
  октябрь: 9,
  октября: 9,
  ноябрь: 10,
  ноября: 10,
  декабрь: 11,
  декабря: 11,
};

function parseMonthYear(value: string) {
  const match = cleanText(value).match(/([а-яё]+)\s+(\d{4})/iu);

  if (!match?.[1] || !match[2]) return null;

  const month = monthIndexes[match[1].toLowerCase()];
  const year = Number(match[2]);

  if (month === undefined || Number.isNaN(year)) return null;

  return { month, year };
}

function getPlural(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;

  return many;
}

function formatDuration(totalMonths: number) {
  if (totalMonths <= 0) return null;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} ${getPlural(years, "год", "года", "лет")}`);
  }

  if (months > 0) {
    parts.push(`${months} ${getPlural(months, "месяц", "месяца", "месяцев")}`);
  }

  return parts.join(" ");
}

export function calculateExperienceDuration(
  value: string | null | undefined,
  now = new Date()
) {
  const text = cleanText(value);

  if (!text) return null;

  if (/\d+\s+(?:год|года|лет|месяц|месяца|месяцев)\b/u.test(text)) {
    return null;
  }

  const parts = text.split(/\s+[—–-]\s+/u);

  if (parts.length < 2) return null;

  const start = parseMonthYear(parts[0] ?? "");
  const endText = parts.slice(1).join(" — ");
  const end =
    /настоящее время|по настоящее|сейчас/i.test(endText)
      ? { month: now.getMonth(), year: now.getFullYear() }
      : parseMonthYear(endText);

  if (!start || !end) return null;

  const totalMonths =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;

  return formatDuration(totalMonths);
}
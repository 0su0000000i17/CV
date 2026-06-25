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
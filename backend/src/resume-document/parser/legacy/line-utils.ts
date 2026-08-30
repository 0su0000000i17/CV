export function normalizeLine(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

export function normalizeTextValue(value?: string | null) {
  const text = value?.replace(/\s+/gu, " ").trim();
  return text || null;
}

export function parseLines(markdown: string) {
  return markdown
    .replace(/\r/gu, "\n")
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function splitCommaItems(value: string) {
  return value.split(/[,;]+/gu).map(normalizeLine).filter(Boolean);
}

export function isServiceLine(value: string) {
  const line = normalizeLine(value);
  return /Резюме обновлено/iu.test(line) ||
    /предпочитаемый способ связи/iu.test(line) ||
    /^\d+\s+(?:из|\/)+\s*\d+$/iu.test(line);
}

export function isAdditionalServiceLine(value: string) {
  const line = normalizeLine(value);
  return /Резюме обновлено/iu.test(line) ||
    /^\d+\s+(?:из|\/)+\s*\d+$/iu.test(line) ||
    /^(?:hh\.ru|HeadHunter)$/iu.test(line);
}

export function isIgnoredVisualElement(value: string) {
  const line = normalizeLine(value);
  return isServiceLine(line) || /^(?:hh\.ru|HeadHunter)$/iu.test(line);
}

export function looksLikeHhResume(lines: string[]) {
  return lines.some((line) => /^Резюме обновлено/iu.test(line)) ||
    lines.some((line) => /^Желаемая должность и зарплата$/iu.test(line));
}

export function extractUpdatedAtRaw(lines: string[]) {
  const line = lines.find((value) => /Резюме обновлено/iu.test(value));
  return line
    ? normalizeTextValue(line.replace(/^.*?Резюме обновлено\s*/iu, ""))
    : null;
}

export function textKey(value: string) {
  return normalizeLine(value).toLowerCase().replace(/[^a-zа-яё0-9+#]+/giu, "");
}

export function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const item = normalizeLine(value);
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

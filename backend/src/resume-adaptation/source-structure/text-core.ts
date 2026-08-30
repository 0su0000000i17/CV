const STOP_WORDS = new Set([
  "и", "в", "на", "с", "со", "по", "для", "что", "как",
  "это", "через", "без", "при", "от", "до", "или",
]);

export function clean(value?: string | null) {
  return value?.replace(/\s+/gu, " ").trim() || "";
}

export function uniqueStable(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const item = clean(value);
    const itemKey = item.toLocaleLowerCase("ru-RU");
    if (!item || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(item);
  }
  return result;
}

export function textKey(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function normalizeToken(token: string) {
  const normalized = token.toLowerCase();
  return normalized.length <= 5 ? normalized : normalized.slice(0, 5);
}

export function textTokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-zа-яё0-9+#.]+/giu)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function similarity(firstValue: string, secondValue: string) {
  const first = new Set(textTokens(firstValue));
  const second = new Set(textTokens(secondValue));
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / Math.min(first.size, second.size);
}

export function isSimilar(first: string, second: string) {
  return similarity(first, second) >= 0.42;
}

export function isNearDuplicate(first: string, second: string) {
  return similarity(first, second) >= 0.82;
}

export function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = clean(value);
    const itemKey = textKey(normalized);
    if (!normalized || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }
  return result;
}

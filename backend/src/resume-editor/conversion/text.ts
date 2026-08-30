export function text(value?: string | null) {
  return value?.replace(/\s+/gu, " ").trim() || "";
}

export function textKey(value: string) {
  return text(value).toLowerCase().replace(/[^a-zа-яё0-9+#]+/giu, "");
}

export function uniquePreserve(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items.map(text).filter(Boolean)) {
    const key = textKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function cleanList(values: string[]) {
  return values.map(text).filter(Boolean);
}

export function removeExactLines(items: string[], blocked: string[]) {
  const blockedKeys = new Set(blocked.map(textKey).filter(Boolean));
  if (!blockedKeys.size) return items;
  return items.filter((item) => !blockedKeys.has(textKey(item)));
}

export function normalizeBulletPrefix(value: string) {
  return text(value).replace(/^[-—–•*]\s*/u, "");
}

export function looksLikeUrl(value: string) {
  return /^https?:\/\//iu.test(value) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/iu.test(value);
}

export function normalizeMultilineValue(value?: string | null) {
  if (!value?.trim()) return null;
  const lines: string[] = [];
  for (const line of value.replace(/\r/gu, '\n').split('\n')) {
    const normalized = line.trim();
    if (!normalized && (!lines.length || lines[lines.length - 1] === '')) continue;
    lines.push(normalized);
  }
  while (lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n') || null;
}

export function normalizeTextValue(value?: string | null) {
  return value?.trim() || null;
}

export function normalizeStringList(value: string[] = []) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function comparableValue(value: unknown) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‐‑‒–—−]+/gu, '-')
    .replace(/\s*-\s*/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim();
}

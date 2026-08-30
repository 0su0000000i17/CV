import { monthNames } from "./constants.js";

function getMonthIndex(rawMonth?: string | null) {
  if (!rawMonth) return 0;

  const normalizedMonth = rawMonth.toLowerCase().replace(/[^\p{L}]/gu, "");
  const key = Object.keys(monthNames).find((candidate) =>
    normalizedMonth.startsWith(candidate)
  );

  return key ? monthNames[key] : 0;
}

function parseDatePoint(value: string, fallbackMonth: number) {
  const yearMatch = value.match(/(?:19|20)\d{2}/u);
  if (!yearMatch) return null;

  const monthMatch = value.match(/[A-Za-zА-Яа-яЁё]+/u);
  const year = Number(yearMatch[0]);
  const month = getMonthIndex(monthMatch?.[0]) || fallbackMonth;

  return { year, month };
}

function monthIndex(point: { year: number; month: number }) {
  return point.year * 12 + point.month;
}

function mergeRanges(ranges: Array<{ start: number; end: number }>) {
  const sortedRanges = ranges.sort((a, b) => a.start - b.start);
  const mergedRanges: Array<{ start: number; end: number }> = [];

  for (const range of sortedRanges) {
    const lastRange = mergedRanges[mergedRanges.length - 1];

    if (!lastRange || range.start > lastRange.end + 1) {
      mergedRanges.push({ ...range });
      continue;
    }

    lastRange.end = Math.max(lastRange.end, range.end);
  }

  return mergedRanges;
}

export function estimateExperienceMonthsFromDateRanges(text: string) {
  const ranges: Array<{ start: number; end: number }> = [];
  const now = new Date();
  const current = now.getFullYear() * 12 + now.getMonth();
  const pattern =
    /((?:[A-Za-zА-Яа-яЁё]+\s+)?(?:19|20)\d{2})\s*[—–-]\s*((?:[A-Za-zА-Яа-яЁё]+\s+)?(?:19|20)\d{2}|настоящее\s+время|по\s+настоящее|present|current)/giu;

  for (const match of text.matchAll(pattern)) {
    const start = parseDatePoint(match[1], 0);
    const endRaw = match[2];
    const end = /настоящее|present|current/iu.test(endRaw)
      ? { year: now.getFullYear(), month: now.getMonth() }
      : parseDatePoint(endRaw, 11);

    if (!start || !end) continue;

    const startIndex = monthIndex(start);
    const endIndex = Math.min(monthIndex(end), current);

    if (endIndex >= startIndex) {
      ranges.push({ start: startIndex, end: endIndex });
    }
  }

  if (!ranges.length) return null;

  return mergeRanges(ranges).reduce(
    (sum, range) => sum + (range.end - range.start + 1),
    0
  );
}

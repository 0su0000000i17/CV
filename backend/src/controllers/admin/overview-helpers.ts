import type { AppEventRow } from "./overview-types.js";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PAID_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

export function createTimeWindows(now = new Date()) {
  return {
    now,
    since24hIso: new Date(now.getTime() - DAY_MS).toISOString(),
    since7dIso: new Date(now.getTime() - 7 * DAY_MS).toISOString(),
    since30dIso: new Date(now.getTime() - 30 * DAY_MS).toISOString(),
  };
}

export function isAfter(value: string | undefined | null, sinceIso: string) {
  return Boolean(value && value >= sinceIso);
}

export function countUnique(values: Array<string | null | undefined>) {
  return new Set(values.filter(Boolean)).size;
}

export function getLatestDate(values: Array<string | null | undefined>) {
  return values.filter(Boolean).sort().at(-1) ?? null;
}

export function groupEventsByType(events: AppEventRow[], sinceIso: string) {
  const grouped: Record<string, number> = {};

  for (const event of events) {
    if (!isAfter(event.created_at, sinceIso)) continue;
    grouped[event.event_type] = (grouped[event.event_type] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count || a.eventType.localeCompare(b.eventType));
}

export function groupByUser<T extends { user_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const existing = grouped.get(row.user_id);
    if (existing) existing.push(row);
    else grouped.set(row.user_id, [row]);
  }
  return grouped;
}

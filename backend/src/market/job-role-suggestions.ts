import { searchRoleCatalog } from "./role-catalog.js";

const HH_API_URL = "https://api.hh.ru";
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 60 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 200;
const HH_USER_AGENT = process.env.HH_API_USER_AGENT ||
  "cvmatch.ru/1.0 (support@cvmatch.ru)";
const HH_ACCESS_TOKEN = process.env.HH_ACCESS_TOKEN?.trim() || null;

type Suggestion = { id: string; text: string };
type HhResponse = { items: Array<{ id?: string | null; text?: string | null }> };
type CacheEntry = { expiresAt: number; value: Suggestion[] };

const cache = new Map<string, CacheEntry>();

export class JobRoleLookupError extends Error {
  constructor(message: string, readonly statusCode = 502) {
    super(message);
  }
}

function normalize(value: string) {
  return value.trim().replace(/\s+/gu, " ");
}

function comparable(value: string) {
  return normalize(value).toLocaleLowerCase("ru-RU");
}

function readCache(key: string) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function writeCache(key: string, value: Suggestion[]) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (typeof oldest !== "string") break;
    cache.delete(oldest);
  }
}

async function fetchRemote(text: string) {
  const url = new URL("/suggests/vacancy_positions", HH_API_URL);
  url.search = new URLSearchParams({ text }).toString();
  let response: globalThis.Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "ru",
        "HH-User-Agent": HH_USER_AGENT,
        "User-Agent": HH_USER_AGENT,
        ...(HH_ACCESS_TOKEN ? { Authorization: `Bearer ${HH_ACCESS_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new JobRoleLookupError("Сервис подсказок hh.ru временно недоступен", 503);
  }
  if (!response.ok) {
    throw new JobRoleLookupError(
      "Сервис подсказок hh.ru временно недоступен",
      response.status >= 500 || response.status === 403 ? 503 : 502,
    );
  }
  return (await response.json()) as HhResponse;
}

export async function searchJobRoles(query: string) {
  const text = normalize(query);
  const key = comparable(text);
  if (key.length < 2) return [];
  const cached = readCache(key);
  if (cached) return cached;
  const catalog = searchRoleCatalog(text);
  let remote: HhResponse["items"] = [];
  try {
    remote = (await fetchRemote(text)).items;
  } catch (error) {
    if (!catalog.length) throw error;
  }
  const seen = new Set<string>();
  const suggestions = [...catalog, ...remote.map((item, index) => ({
    id: item.id || `${key}-${index}`,
    text: normalize(item.text || ""),
  }))].flatMap((item) => {
    const itemKey = comparable(item.text);
    if (!item.text || seen.has(itemKey)) return [];
    seen.add(itemKey);
    return [item];
  }).slice(0, 20);
  writeCache(key, suggestions);
  return suggestions;
}

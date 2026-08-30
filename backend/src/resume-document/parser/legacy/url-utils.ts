import { normalizeTextValue, uniqueStrings } from "./line-utils.js";

const URL_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/[^\s,]*)?/giu;
const KNOWN_TLDS = new Set([
  "ru", "рф", "com", "org", "net", "io", "ai", "co", "me", "info",
  "biz", "app", "dev", "site", "online", "pro", "tech", "digital",
  "agency", "store", "cloud", "systems", "solutions", "global", "xyz",
  "space", "team", "work", "jobs", "by", "kz", "ua", "su", "eu",
  "de", "fr", "uk", "us", "cn",
]);

function isUrlCandidate(value: string) {
  const text = value.trim();
  if (/^https?:\/\//iu.test(text) || /^www\./iu.test(text)) return true;
  const tld = text.match(/\.([a-zа-яё]{2,})(?:\/|$)/iu)?.[1]?.toLowerCase();
  return Boolean(tld && KNOWN_TLDS.has(tld));
}

function findUrls(value: string) {
  return Array.from(value.matchAll(URL_PATTERN))
    .map((match) => match[0])
    .filter(isUrlCandidate);
}

export function hasUrl(value: string) {
  return findUrls(value).length > 0;
}

export function extractLinks(text: string) {
  return uniqueStrings(
    Array.from(text.matchAll(URL_PATTERN))
      .filter((match) => {
        const value = match[0] ?? "";
        return text[(match.index ?? 0) - 1] !== "@" && isUrlCandidate(value);
      })
      .map((match) => match[0]),
  );
}

export function parseCompanyCityUrl(line: string, allowStandaloneCity = false) {
  const url = findUrls(line)[0] ?? null;
  const withoutUrl = normalizeTextValue(
    line.replace(url ?? "", "").replace(/,\s*$/u, "").replace(/^,\s*/u, "").trim(),
  );
  const city = url ? withoutUrl :
    allowStandaloneCity && isStandaloneCityCandidate(line) ? normalizeTextValue(line) : null;
  return { city, url };
}

function isStandaloneCityCandidate(value: string) {
  const line = value.replace(/^•\s*/u, "").trim();
  return Boolean(
    line && line.length <= 40 && !/[,/:@0-9]/u.test(line) &&
    /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/u.test(line),
  );
}

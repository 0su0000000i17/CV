import { normalizeTextValue } from "./line-utils.js";

export function normalizeRelocation(line: string) {
  if (/не\s+готов[а]?\s+к\s+переезду/iu.test(line)) return "не готов к переезду";
  return normalizeTextValue(
    line
      .replace(/готов[а]?\s+к\s+переезду/giu, "")
      .replace(/готов[а]?\s+к\s+редким\s+командировкам/giu, "")
      .replace(/готов[а]?\s+к\s+командировкам/giu, "")
      .replace(/не\s+готов[а]?\s+к\s+командировкам/giu, "")
      .replace(/^[:,;\s]+|[:,;\s]+$/gu, "")
      .replace(/([а-яё])([А-ЯЁ])/gu, "$1, $2")
      .replace(/,\s*,+/gu, ",")
      .replace(/\s*,\s*/gu, ", ")
      .replace(/\s{2,}/gu, " "),
  );
}

export function extractBusinessTrips(line: string) {
  if (/не\s+готов[а]?\s+к\s+командировкам/iu.test(line)) return "не готов к командировкам";
  if (/готов[а]?\s+к\s+редким\s+командировкам/iu.test(line)) {
    return "готов к редким командировкам";
  }
  if (/готов[а]?\s+к\s+командировкам/iu.test(line)) return "готов к командировкам";
  return null;
}

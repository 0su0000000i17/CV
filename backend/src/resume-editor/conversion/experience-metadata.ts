import type { SourceResumeDocument } from "../../resume-document/types.js";
import {
  looksLikeUrl,
  normalizeBulletPrefix,
  text,
  textKey,
  uniquePreserve,
} from "./text.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

function rawExperienceLines(item: ExperienceItem) {
  return item.raw.slice(item.dates.raw.length).map(text).filter(Boolean);
}

function isLikelyCityName(value: string) {
  const line = text(value);
  if (!line || line.length > 60 || /[A-Za-z0-9@/:()]/u.test(line)) return false;
  const words = line.split(/\s+/u).filter(Boolean);
  return words.length > 0 && words.length <= 3
    && words.every((word) => /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/u.test(word));
}

function extractMixedCityUrl(value: string) {
  const line = normalizeBulletPrefix(value);
  const url = line.match(/(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/[^\s,]*)?/iu)?.[0] || "";
  if (!url) return [];
  const city = text(line.replace(url, "").replace(/^[,;\s]+|[,;\s]+$/gu, ""));
  return isLikelyCityName(city) ? [city, url].filter(Boolean) : [];
}

function isServiceLine(value: string) {
  return /резюме\s+обновлено|предпочитаемый\s+способ\s+связи/iu.test(value);
}

function isIndustry(value: string) {
  const line = normalizeBulletPrefix(value).toLowerCase();
  if (!line) return false;
  return line === "банк" || line === "финансовый сектор"
    || /информационные\s+технологии|системная\s+интеграция|интернет|разработка\s+программного\s+обеспечения|ритейл|производство|образование|медицина|строительство|маркетинг|реклама|консалтинг/iu.test(line);
}

function isPosition(value: string) {
  const line = text(value);
  if (!line || /^(?:Компания|Команда|Стек|Технологии|Работал[аи]?\s+над|Примеры задач)\b/iu.test(line)) return false;
  if (looksLikeUrl(line) || extractMixedCityUrl(line).length || /^[-—–•*]/u.test(line)) return false;
  return /developer|разработчик|программист|инженер|designer|дизайнер|manager|менеджер|аналитик|qa|тестировщик|backend|frontend|fullstack|devops|smm|маркетолог/iu.test(line);
}

function isCompany(value: string) {
  const line = text(value);
  if (!line || line.length > 80 || isServiceLine(line) || isLikelyCityName(line) || isIndustry(line)) return false;
  if (looksLikeUrl(line) || extractMixedCityUrl(line).length || isPosition(line)) return false;
  if (/^[-—–•*]/u.test(line) || /:/u.test(line)) return false;
  if (/^(?:Компания|Команда|Стек|Технологии|Работал[аи]?\s+над|Примеры задач|Обязанности|Задачи|Достижения)\b/iu.test(line)) return false;
  return /[a-zа-яё0-9]/iu.test(line);
}

function isMetaLine(value: string) {
  return extractMixedCityUrl(value).length > 0 || isLikelyCityName(value)
    || looksLikeUrl(value) || isIndustry(value);
}

function headerLines(lines: string[]) {
  const index = lines.findIndex((line) => /^[-—–•*]/u.test(text(line)));
  return index >= 0 ? lines.slice(0, index) : lines;
}

export function resolveRawPosition(item: ExperienceItem) {
  const parsed = text(item.position);
  return parsed || headerLines(rawExperienceLines(item)).find(isPosition) || "";
}

export function resolveExperienceConstants(item: ExperienceItem, position: string) {
  const lines = headerLines(rawExperienceLines(item).filter((line) => !isServiceLine(line)));
  const exactIndex = lines.findIndex((line) => textKey(line) === textKey(position));
  const positionIndex = exactIndex >= 0 ? exactIndex : lines.findIndex(isPosition);
  const before = positionIndex >= 0 ? lines.slice(0, positionIndex) : lines;
  const company = before.find(isCompany) || "";
  const metaLines = uniquePreserve(before
    .filter((line) => !company || textKey(line) !== textKey(company))
    .filter(isMetaLine)
    .flatMap((line) => extractMixedCityUrl(line).length
      ? extractMixedCityUrl(line)
      : [normalizeBulletPrefix(line)]));
  return { company, metaLines };
}

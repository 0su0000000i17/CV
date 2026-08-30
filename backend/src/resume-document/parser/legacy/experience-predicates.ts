import { isDurationLine, isExperienceDateStart } from "./experience-dates.js";
import { isServiceLine, normalizeLine, normalizeTextValue } from "./line-utils.js";
import { hasUrl } from "./url-utils.js";

const STACK_TITLE = /^(?:Стек|Технологии|Ключевой стек|Инструменты)\s*:?$/iu;
const SECTION_TITLE =
  /^(?:Обязанности|Достижения|Основные задачи|Ключевые задачи|Проекты|Описание проекта|Роль|Задачи|Функции|Что делал[аи]?)\s*:?$/iu;

export function isStackTitle(line: string) {
  return STACK_TITLE.test(normalizeLine(line));
}

export function isExperienceTextSectionTitle(line: string) {
  return SECTION_TITLE.test(normalizeLine(line));
}

export function cleanExperienceSectionTitle(line: string) {
  return normalizeLine(line).replace(/:$/u, "");
}

export function isExperienceServiceLabel(line: string) {
  return /^(?:команда|компания)\s*[:—-]/iu.test(normalizeLine(line));
}

export function isBulletLine(line: string) {
  return /^[-—–•*]\s*/u.test(normalizeLine(line));
}

export function stripBullet(line: string) {
  return normalizeLine(line).replace(/^[-—–•*]+\s*/u, "");
}

function isExperienceContentStartLine(line: string) {
  const value = normalizeLine(line);
  return isStackTitle(value) || isExperienceTextSectionTitle(value) ||
    /^Компания\s*[—-]/iu.test(value) || /^Команда\s*:/iu.test(value) ||
    /^Работал[аи]?\s+над\s+проектами/iu.test(value);
}

export function isPlaceholderLine(line: string) {
  const value = normalizeLine(line);
  return /^(?:[-—–]|(?:—\s*)?предпочитаемый способ связи)$/iu.test(value) ||
    isServiceLine(value);
}

export function normalizeCompanyName(value?: string | null) {
  const text = normalizeTextValue(value);
  if (!text || isPlaceholderLine(text) || isExperienceDateStart(text) || isDurationLine(text)) {
    return null;
  }
  return text;
}

export function isLikelyPositionLine(value?: string | null) {
  const line = normalizeLine(value ?? "");
  if (!line || isServiceLine(line) || isBulletLine(line) || hasUrl(line)) return false;
  return /(?:developer|engineer|разработчик|программист|инженер|тестировщик|\bqa\b|менеджер|специалист|руководитель|директор|аналитик|дизайнер|редактор|фотограф|маркетолог|администратор|архитектор|devops|frontend|backend|fullstack|smm|контент-менеджер|лид|lead)/iu.test(line);
}

function isCompanyCityUrlLine(line: string, next?: string, afterNext?: string) {
  const value = normalizeLine(line);
  if (!value) return false;
  if (hasUrl(value)) return true;
  if (isExperienceContentStartLine(value)) return false;
  if (value.length > 60 || /[A-Za-z0-9@/:()]/u.test(value)) return false;
  const words = value.split(/\s+/u).filter(Boolean);
  const cityLike = words.length > 0 && words.length <= 3 && words.every((word) =>
    /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/u.test(word),
  );
  return Boolean(cityLike && next && afterNext?.startsWith("•"));
}

export function isCompanyMetaLine(value?: string | null) {
  const line = normalizeLine(value ?? "");
  if (!line || isServiceLine(line)) return true;
  if (isCompanyCityUrlLine(line) || isBulletLine(line)) return true;
  return !isExperienceContentStartLine(line) && !/:$/u.test(line);
}

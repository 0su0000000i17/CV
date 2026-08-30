import { cleanText } from "../text.js";

export function skillKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function isEducationLike(value: string) {
  const text = cleanText(value);
  return Boolean(text) && !/^\d{4}$/u.test(text) &&
    /(?:университет|институт|академи[яи]|колледж|техникум|лицей|школа|факультет|кафедра|бакалавр|магистр)/iu.test(text);
}

function isSkillHeading(value: string) {
  return /^(?:навыки|ключевые навыки|знание языков)$/iu.test(cleanText(value));
}

function isLanguageLike(value: string) {
  return /^(?:(?:русский|английский|немецкий|французский|испанский|итальянский|китайский|японский|корейский|турецкий|арабский|португальский|польский|украинский|белорусский|казахский)(?:\s+язык)?|язык|[abc][12]|родной|базовый|средний|продвинутый|средне-продвинутый)$/iu.test(cleanText(value));
}

function isCityOnly(value: string) {
  return /^(?:москва|санкт-петербург|луганск|краснодар|воронеж|екатеринбург|томск|усть-лабинск|ульяновск|симферополь)$/iu.test(cleanText(value));
}

export function isValidSkillValue(value: string) {
  const text = cleanText(value);
  const lower = text.toLowerCase();
  if (!text || isEducationLike(text) || isSkillHeading(text) ||
    isLanguageLike(text) || isCityOnly(text) || /^\d+$/u.test(text)) return false;
  return !["и", "или", "and", "or", "the", "of", "a", "an", "для", "по"].includes(lower);
}

export function splitExplicitSkillValue(value: string) {
  return cleanText(value).split(/[\n,;|•]+/u).map(cleanText).filter(Boolean);
}

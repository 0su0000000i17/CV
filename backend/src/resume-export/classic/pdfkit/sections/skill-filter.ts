import { clean, textKey } from "../helpers.js";

function isBadSkillTag(value: string) {
  const text = clean(value);
  if (!text || !/[\p{L}\p{N}+#.]/u.test(text) || /^\d{4}$/u.test(text)) return true;
  if (/^(?:Уровень|Высшее|Среднее(?: образование| специальное)?|Неоконченное высшее|Бакалавр|Магистр|Навыки|Ключевые навыки|Знание языков)$/iu.test(text)) return true;
  if (/^(?:(?:русский|английский|немецкий|французский|испанский|итальянский|китайский|японский|корейский|турецкий|арабский|португальский|польский|украинский|белорусский|казахский)(?:\s+язык)?|язык|[abc][12]|родной|базовый|средний|продвинутый|средне-продвинутый)$/iu.test(text)) return true;
  if (/^[А-ЯЁ]\.?\s+[А-ЯЁ][а-яё-]+$/u.test(text)) return true;
  return /(университет|институт|академи[яи]|колледж|техникум|училище|лицей|гимнази[яи]|факультет|кафедра)/iu.test(text);
}

export function removeRedundantSkillTags(values: string[]) {
  const cleanValues = values.map(clean).filter((value) => !isBadSkillTag(value));
  const keys = new Set(cleanValues.map((value) => textKey(value)));
  return cleanValues.filter((value) => {
    const words = clean(value).split(" ").filter(Boolean);
    return !(words.length > 1 && words.every((word) => keys.has(textKey(word))));
  });
}

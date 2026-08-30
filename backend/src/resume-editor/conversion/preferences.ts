import { text } from "./text.js";

export function normalizeRelocation(value?: string | null) {
  const normalized = text(value);
  if (/^не(?:\s*,\s*не)?$/iu.test(normalized)) return "не готов к переезду";
  return normalized;
}

export function normalizeEmployment(value?: string | null) {
  const normalized = text(value);
  if (/полная\s+занятость/iu.test(normalized)) return "Постоянная работа";
  if (/частичная\s+занятость|подработка/iu.test(normalized)) return "Подработка";
  if (/стажиров/iu.test(normalized)) return "Стажировка";
  if (/волонт/iu.test(normalized)) return "Волонтёрство";
  return normalized || null;
}

export function normalizeWorkFormat(value?: string | null) {
  const normalized = text(value);
  if (!normalized) return null;
  return normalized.split(/[,;]+/u).map((item) => {
    if (/удал/iu.test(item)) return "Удалённо";
    if (/гибрид/iu.test(item)) return "Гибрид";
    if (/офис|на месте/iu.test(item)) return "На месте работодателя";
    if (/разъезд/iu.test(item)) return "Разъездная";
    if (/вахт/iu.test(item)) return "Вахта";
    return text(item);
  }).filter(Boolean).join(", ");
}

export function normalizeCommute(value?: string | null) {
  const normalized = text(value);
  if (!normalized) return null;
  if (/не\s+имеет\s+значения/iu.test(normalized)) return "Не имеет значения";
  if (/1[,.]5\s*час/iu.test(normalized)) return "Не дольше 1,5 часов";
  if (/1\s*час/iu.test(normalized)) return "Не дольше 1 часа";
  return normalized;
}

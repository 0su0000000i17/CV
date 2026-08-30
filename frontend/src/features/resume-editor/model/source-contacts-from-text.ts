import type { ContactDraft } from './types';

const emptyContacts: ContactDraft = {
  fullName: '', gender: '', age: '', birthDate: '', phone: '', email: '', city: '',
  citizenship: '', workPermit: '', relocation: '', businessTrips: '',
};
const lines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean);
const lineValue = (text: string, label: string) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(`${escaped}:?\\s*([^\\n]+)`, 'i'))?.[1]?.trim() || '';
};
export function normalizeBusinessTrips(value: string) {
  if (/не\s+готов[а]?\s+к\s+командировкам/i.test(value)) return 'не готов к командировкам';
  if (/готов[а]?\s+к\s+командировкам/i.test(value)) return 'готов к командировкам';
  return value.trim();
}
export function normalizeRelocation(value: string) {
  if (/не\s+готов[а]?\s+к\s+переезду|^не(?:\s*,\s*не)?$/i.test(value)) return 'не готов к переезду';
  return value.replace(/готов[а]?\s+к\s+переезду/gi, '')
    .replace(/не\s+готов[а]?\s+к\s+командировкам/gi, '')
    .replace(/готов[а]?\s+к\s+командировкам/gi, '')
    .replace(/^[:,;\s]+|[:,;\s]+$/g, '').replace(/([а-яё])([А-ЯЁ])/gu, '$1, $2')
    .replace(/,\s*,+/g, ',').replace(/\s*,\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
}

export function contactsFromResumeText(rawText: string): ContactDraft {
  const text = rawText.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
  const cleanLines = lines(text);
  const profileLine = cleanLines.find((line) => /^(Мужчина|Женщина),\s*\d+/.test(line)) || '';
  const profile = profileLine.match(/^(Мужчина|Женщина),\s*([^,]+)(?:,\s*родил(?:ся|ась)\s+(.+))?/i);
  const relocation = lineValue(text, 'Готов к переезду');
  const phoneLine = cleanLines.find((line) => {
    const count = line.replace(/\D/g, '').length;
    return count >= 10 && count <= 15;
  });
  const citizenship = text.match(/Гражданство:\s*([^\n]+)/i)?.[1]
    ?.replace(/,?\s*(?:есть\s+)?разрешение на работу:.*$/iu, '').trim() || '';
  return {
    ...emptyContacts,
    fullName: cleanLines.slice(0, 8).find((line) =>
      /^[А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+){1,3}$/.test(line)) || '',
    gender: profile?.[1]?.trim() || '', age: profile?.[2]?.trim() || '',
    birthDate: profile?.[3]?.trim() || '',
    phone: phoneLine?.replace(/—.*$/, '').replace(/предпочитаемый способ связи/gi, '').trim() || '',
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '',
    city: lineValue(text, 'Проживает'), citizenship,
    workPermit: text.match(/разрешение на работу:\s*([^\n]+)/i)?.[1]?.trim() || '',
    relocation: normalizeRelocation(relocation),
    businessTrips: normalizeBusinessTrips(relocation),
  };
}

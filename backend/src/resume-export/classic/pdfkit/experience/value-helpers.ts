import { toTextLines } from "../../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../../types.js";
import { clean, looksLikeUrl, textKey } from "../helpers.js";
import { colors } from "../layout.js";

const months = "январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь";

function lower(value: string) {
  return clean(value).toLowerCase();
}

function experienceKey(value: string) {
  const text = clean(value).replace(/^[-•]\s*/u, "");
  if (looksLikeUrl(text)) {
    return text.toLowerCase().replace(/^https?:\/\//u, "").replace(/^www\./u, "")
      .replace(/[/?#]+$/u, "");
  }
  return textKey(text);
}

export function hasSalary(doc: ClassicDocument, value: string) {
  const salary = lower(doc.adaptation.target.salary || "");
  return Boolean(salary && lower(value).includes(salary));
}

export function isRole(value: string) {
  const text = clean(value);
  return Boolean(text && !text.includes(":")
    && /(?:^|[\s\-‑–—\/])(разработчик|developer|engineer|программист|инженер|тестировщик|аналитик|дизайнер|менеджер|специалист|руководитель|директор|редактор|фотограф|маркетолог|администратор)(?:\s|$)/iu.test(text));
}

export function isStop(value: string) {
  const text = clean(value);
  return new RegExp(`^(?:${months})\\s+\\d{4}`, "iu").test(text)
    || /^(Образование|Навыки|Дополнительная информация|Резюме обновлено)(\s|$)/iu.test(text);
}

export function isCity(value: string) {
  const text = clean(value);
  if (!text || text.length > 60 || /[A-Za-z0-9@/:()]/u.test(text)) return false;
  const words = text.split(/\s+/u).filter(Boolean);
  return words.length > 0 && words.length <= 3
    && words.every((word) => /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/u.test(word));
}

export function sameExperienceValue(first: string, second: string) {
  const key = experienceKey(first);
  return Boolean(key && key === experienceKey(second));
}

export function bareExperienceValue(value: string) {
  return clean(value).replace(/^[-•]\s*/u, "");
}

export function experienceMetaColor(value: string) {
  const text = clean(value);
  const muted = !text.startsWith("•")
    && (looksLikeUrl(text) || isCity(bareExperienceValue(text)));
  return muted ? colors.lightMuted : colors.text;
}

export function sourceLines(doc: ClassicDocument) {
  return toTextLines(doc.sourceText).map(clean).filter(Boolean);
}

export function companyIndex(doc: ClassicDocument, item: ClassicExperienceItem) {
  const company = clean(item.company);
  return company ? sourceLines(doc).findIndex((line) => line === company) : -1;
}

export function sourceExperienceItem(doc: ClassicDocument, item: ClassicExperienceItem) {
  return doc.sourceDocument?.experience.items
    .find((candidate) => candidate.sourceIndex === item.sourceIndex) || null;
}

export function isCompanyCandidate(doc: ClassicDocument, value: string) {
  const text = bareExperienceValue(value);
  if (!text || hasSalary(doc, text) || isRole(text) || isCity(text) || isStop(text)) return false;
  if (text.includes(":") || text.startsWith("•") || text.includes(",") || looksLikeUrl(text)) return false;
  return text.length <= 90;
}

export function dedupeExperienceValues(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map(clean).filter(Boolean)) {
    if (isRole(value)) continue;
    const key = experienceKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

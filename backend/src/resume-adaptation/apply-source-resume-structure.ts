import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { AdaptedResumeSkills, ResumeAdaptationResult } from "./types.js";

type ExperienceItem = ResumeAdaptationResult["adaptedResume"]["experience"][number];

type SupportContext = {
  sourceText: string;
  sourceTextKey: string;
  originalSkills: string[];
};

const stopWords = new Set([
  "и",
  "в",
  "на",
  "с",
  "по",
  "для",
  "что",
  "как",
  "это",
  "через",
  "без",
  "при",
  "от",
  "до",
]);

const protectedClaims = [
  "After Effects",
  "Premiere Pro",
  "VN",
  "Midjourney",
  "Runway",
  "Pika",
  "Sora",
  "Telegram",
  "VK",
  "ВКонтакте",
  "Instagram",
  "Инстаграм",
];

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function key(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function normalizeToken(token: string) {
  const normalized = token.toLowerCase();
  if (normalized.length <= 5) return normalized;

  return normalized.slice(0, 5);
}

function tokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-zа-яё0-9+#.]+/giu)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function similarity(a: string, b: string) {
  const first = new Set(tokens(a));
  const second = new Set(tokens(b));
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / Math.min(first.size, second.size);
}

function isSimilar(a: string, b: string) {
  return similarity(a, b) >= 0.42;
}

function extractSalary(value?: string | null) {
  const text = clean(value);
  const match = text.match(
    /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/iu
  );

  return match?.[0] ? clean(match[0]) : null;
}

function isSalaryLine(value?: string | null) {
  const text = clean(value);
  const salary = extractSalary(text);

  if (!text || !salary) return false;

  return text.replace(/[.,;:]$/u, "").length <= salary.length + 14;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = clean(value);
    const itemKey = key(normalized);
    if (!normalized || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }
  return result;
}

function isAiRelated(value: string) {
  return /нейросет|искусственн\s+интеллект|\b(?:ai|ии)\b|chatgpt|perplexity|krea|kling|google\s+ai/iu.test(value);
}

function collectExperienceSalary(items: ExperienceItem[]) {
  for (const item of items) {
    const salary = extractSalary(item.position) || extractSalary(item.focus);
    if (salary && (isSalaryLine(item.position) || isSalaryLine(item.focus))) {
      return salary;
    }

    const bulletSalary = item.adaptedBullets
      .map((bullet) => (isSalaryLine(bullet) ? extractSalary(bullet) : null))
      .find(Boolean);

    if (bulletSalary) return bulletSalary;
  }

  return null;
}

function resolvePosition(original: ExperienceItem, adapted: ExperienceItem | null) {
  const originalPosition = clean(original.position);
  const adaptedPosition = clean(adapted?.position);

  if (isSalaryLine(originalPosition)) {
    return adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null;
  }

  return originalPosition || (adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null);
}

function findAdapted(items: ExperienceItem[], sourceIndex: number, fallbackIndex: number) {
  return items.find((item) => item.sourceIndex === sourceIndex) || items[fallbackIndex] || null;
}

function isSupportedClaim(value: string, context: SupportContext) {
  const itemKey = key(value);

  if (!itemKey) return false;
  if (context.sourceTextKey.includes(itemKey)) return true;
  if (isAiRelated(value) && isAiRelated(context.sourceText)) return true;

  const valueTokens = tokens(value);
  const supportedTokenCount = valueTokens.filter((token) => context.sourceTextKey.includes(token)).length;
  if (valueTokens.length > 0 && supportedTokenCount / valueTokens.length >= 0.65) {
    return true;
  }

  return context.originalSkills.some((skill) => key(skill) === itemKey || isSimilar(skill, value));
}

function cleanupUnsupportedClaimText(value: string) {
  return value
    .replace(/\((?:\s*[,/;]?\s*)+\)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/,\s*([).])/g, "$1")
    .replace(/\s+,/g, ",")
    .replace(/(?:включая|в том числе)\s*[,.]?\s*([.)])/giu, "$1")
    .replace(/\b(?:в|на|для|через|с помощью)\s*[,.]/giu, ".")
    .replace(/\b(?:включая|в том числе)\s*$/giu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .trim();
}

function sanitizeUnsupportedClaims(value: string, context: SupportContext) {
  let result = clean(value);

  for (const claim of protectedClaims) {
    if (isSupportedClaim(claim, context)) continue;

    result = result.replace(new RegExp(`\\b${escapeRegExp(claim)}\\b`, "giu"), "");
  }

  return cleanupUnsupportedClaimText(result);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeResumeText(value: string) {
  return clean(value)
    .replace(/\bРИЛС\b/giu, "Reels")
    .replace(/сьемк/giu, "съёмк")
    .replace(/съемк/giu, "съёмк")
    .replace(/Видеосъемка/giu, "Видеосъёмка")
    .replace(/некнейм/giu, "никнейм")
    .replace(/шапка профиля\+/giu, "шапка профиля +")
    .replace(/,stories/giu, ", stories")
    .replace(/Abode Photoshop/giu, "Adobe Photoshop")
    .replace(/Google AI Stutio/giu, "Google AI Studio")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function polishBullet(value: string) {
  const text = normalizeResumeText(value);
  const lower = text.toLowerCase();

  if (/^анализ(?:ировал)?\s+конкурент/u.test(lower)) {
    return "Анализировал конкурентную среду и контент-подходы, чтобы уточнять рубрики, визуальный стиль и подачу бренда";
  }

  if (/формирован|формировал.*един.*стил/u.test(lower)) {
    return "Формировал единый визуальный стиль аккаунта, передающий атмосферу бренда и поддерживающий цельную подачу в ленте";
  }

  if (/создан.*аккаунт.*с нуля|создавал.*аккаунт.*с нуля|запускал.*аккаунт/u.test(lower)) {
    return "Запускал аккаунт с нуля: подбирал позиционирование, структуру профиля, визуальную подачу и первые рубрики";
  }

  if (/переупаков/u.test(lower)) {
    return "Переупаковывал аккаунт: обновлял визуальную подачу, структуру профиля и оформление ключевых разделов";
  }

  if (/контент[- ]план/u.test(lower)) {
    return "Разрабатывал контент-план на 14 дней / 1 месяц с учётом рубрик, визуальной логики, тем публикаций и регулярности выхода контента";
  }

  if (/reels|рилс/u.test(lower)) {
    return "Создавал Reels-контент: искал референсы, писал сценарии, организовывал съёмки и монтировал ролики под задачи бренда";
  }

  if (/написан.*пост|писал.*пост/u.test(lower)) {
    return "Писал посты с учётом тональности бренда, задачи публикации и вовлечения аудитории";
  }

  if (/никнейм|шапк.*профил|аватар/u.test(lower)) {
    return "Прорабатывал упаковку профиля: подбирал никнейм, оформлял шапку аккаунта и аватар под позиционирование бренда";
  }

  if (/stories|сторис/u.test(lower)) {
    return "Вёл stories: готовил ежедневные форматы, визуальные материалы и коммуникационные сценарии для поддержания активности аккаунта";
  }

  if (/обработ.*фото|инфограф/u.test(lower)) {
    return "Обрабатывал фотографии и создавал инфографику для афиш, stories и постов в едином визуальном стиле";
  }

  if (/работ.*ии|нейросет|chatgpt|perplexity|krea|kling/u.test(lower)) {
    return "Использовал ИИ-инструменты для подготовки визуальных идей, текстов и контентных материалов";
  }

  if (/актуальн/u.test(lower)) {
    return "Оформлял актуальные разделы профиля: продумывал названия, обложки и визуальную структуру для быстрого доступа к ключевой информации";
  }

  if (/верстк.*меню|дизайн.*меню/u.test(lower)) {
    return "Верстал меню и разрабатывал его дизайн, сохраняя единый визуальный стиль бренда";
  }

  if (/коммуникац|подписчик/u.test(lower)) {
    return "Коммуницировал с подписчиками, поддерживал обратную связь и вовлечение аудитории в аккаунте";
  }

  if (/подготовк.*тем|рубрик|сценар/u.test(lower)) {
    return "Готовил темы, рубрики и сценарии публикаций: искал идеи, формулировал тезисы и подбирал референсы";
  }

  if (/координац.*контент|планирован.*срок|контроль публикац/u.test(lower)) {
    return "Координировал выпуск контента: планировал сроки, собирал материалы и контролировал публикации по графику";
  }

  if (/визуальн.*оформ|обложк|превью/u.test(lower)) {
    return "Создавал визуальное оформление для постов: обложки, превью и единый стиль ленты";
  }

  if (/видеосъ[её]мк|видео.*съ[её]мк|монтаж видео|обработка видео/u.test(lower)) {
    return "Снимал и монтировал видеоконтент для коротких форматов, адаптируя визуальную подачу под задачи публикации";
  }

  return text;
}

function normalizeNotAddedValue(value: string) {
  const normalized = clean(value)
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта:\s*/iu, "")
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта\s+работы\s+с\s+/iu, "")
    .replace(/^Нет\s+опыта\s+работы\s+с\s+/iu, "")
    .replace(/^Опыт\s+работы\s+с\s+/iu, "")
    .replace(/^Выдумывание\s+опыта\s+работы\s+с\s+/iu, "");

  if (/блогер/i.test(normalized)) return "Работа с блогерами";
  if (/цветокоррекц|звук|субтитр|динамичн.*переход/i.test(normalized)) {
    return "Цветокоррекция, звук, субтитры и динамичные переходы";
  }

  return normalized;
}

function normalizeNotAdded(items: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const normalized = normalizeNotAddedValue(item);
    const itemKey = key(normalized);
    if (!normalized || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }

  return result;
}

function mergeBullets(original: string[], adapted: string[], context: SupportContext) {
  const originalItems = unique(original)
    .filter((item) => !isSalaryLine(item))
    .map(polishBullet);
  const adaptedItems = unique(adapted)
    .filter((item) => !isSalaryLine(item))
    .map((item) => sanitizeUnsupportedClaims(item, context))
    .filter(Boolean)
    .map(polishBullet);

  if (!originalItems.length) return unique(adaptedItems);
  if (!adaptedItems.length) return unique(originalItems);

  const targetCount = Math.min(Math.max(originalItems.length, adaptedItems.length), 16);
  const minimumUsefulAdaptedCount = Math.max(
    originalItems.length >= 8 ? 7 : originalItems.length,
    Math.ceil(originalItems.length * 0.75)
  );

  if (adaptedItems.length >= minimumUsefulAdaptedCount) {
    return unique(adaptedItems).slice(0, targetCount);
  }

  const result = [...adaptedItems];
  const seen = new Set(result.map(key));

  for (const bullet of originalItems) {
    if (result.length >= targetCount) break;
    const bulletKey = key(bullet);
    if (seen.has(bulletKey) || result.some((item) => isSimilar(item, bullet))) continue;
    seen.add(bulletKey);
    result.push(bullet);
  }

  return unique(result).slice(0, targetCount);
}

function mergeFocus(originalFocus: string | null, adaptedFocus: string | null | undefined, context: SupportContext) {
  const adapted = sanitizeUnsupportedClaims(clean(adaptedFocus), context);
  if (adapted && !isSalaryLine(adapted)) return adapted;
  return unique(originalFocus?.split("\n") || [])
    .filter((item) => !isSalaryLine(item))
    .map(polishBullet)
    .join("\n") || null;
}

function mergeExperienceItem(
  original: ExperienceItem,
  adapted: ExperienceItem | null,
  context: SupportContext
): ExperienceItem {
  const adaptedBullets = adapted?.adaptedBullets || [];
  const preservedFacts = adapted?.preservedFacts?.length ? adapted.preservedFacts : original.preservedFacts;
  return {
    sourceIndex: original.sourceIndex,
    company: original.company,
    companyUrl: original.companyUrl,
    position: resolvePosition(original, adapted),
    dates: original.dates,
    adaptedBullets: mergeBullets(original.adaptedBullets, adaptedBullets, context),
    focus: mergeFocus(original.focus, adapted?.focus, context),
    preservedFacts: unique(preservedFacts).slice(0, 16),
    warnings: adapted?.warnings || [],
  };
}

function splitSkillLine(value: string) {
  return clean(value)
    .replace(/([а-яёa-z])\s+([А-ЯЁA-Z])/g, "$1|$2")
    .split(/[|,;•]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !/русский|родной/i.test(item));
}

function createOriginalSkillPhrases(original: AdaptedResumeSkills) {
  return unique([...original.primary, ...original.secondary].flatMap(splitSkillLine));
}

function findSupportedSkill(value: string, context: SupportContext) {
  const normalized = sanitizeUnsupportedClaims(value, context);
  if (!normalized) return null;

  const valueKey = key(normalized);
  const exact = context.originalSkills.find((skill) => key(skill) === valueKey);
  if (exact) return normalized;

  if (isSupportedClaim(normalized, context)) return normalized;

  return context.originalSkills.some((skill) => isSimilar(skill, normalized)) ? normalized : null;
}

function mergeSkills(original: AdaptedResumeSkills, adapted: AdaptedResumeSkills, context: SupportContext) {
  const addSupported = (items: string[]) =>
    unique(items)
      .map((item) => findSupportedSkill(item, context))
      .filter((item): item is string => Boolean(item));

  const primary = unique(addSupported([...adapted.primary, ...adapted.secondary]));
  const used = new Set(primary.map(key));
  const secondary = context.originalSkills.filter((skill) => !used.has(key(skill)));

  return {
    primary: primary.length ? primary : unique(original.primary),
    secondary,
    deprioritized: unique(adapted.deprioritized).filter((item) => Boolean(findSupportedSkill(item, context))),
    notAdded: normalizeNotAdded(adapted.notAdded),
  };
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }

  return [];
}

function createSupportContext(original: ResumeAdaptationResult): SupportContext {
  const originalSkills = createOriginalSkillPhrases(original.adaptedResume.skills);
  const sourceText = collectText(original).join("\n");

  return {
    sourceText,
    sourceTextKey: key(sourceText),
    originalSkills,
  };
}

function filterSupportedKeywords(items: string[], context: SupportContext) {
  return unique(items).filter((item) => isSupportedClaim(item, context));
}

function resolveTargetTitle(params: {
  sourceTitle?: string | null;
  adaptedTitle?: string | null;
  headline?: string | null;
}) {
  const sourceTitle = clean(params.sourceTitle);
  const adaptedTitle = clean(params.adaptedTitle);
  const headline = clean(params.headline);

  if (headline && headline !== sourceTitle) return headline;
  if (adaptedTitle) return adaptedTitle;
  return sourceTitle || null;
}

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = params.adaptation;
  const target = original.target;
  const context = createSupportContext(original);
  const sourceSalary = collectExperienceSalary(original.adaptedResume.experience);
  const experience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(item, findAdapted(adapted.adaptedResume.experience, item.sourceIndex, index), context)
  );
  return {
    ...adapted,
    target: {
      title: resolveTargetTitle({
        sourceTitle: target.title,
        adaptedTitle: adapted.target.title,
        headline: adapted.adaptedResume.headline,
      }),
      company: null,
      seniority: target.seniority || null,
      salary: target.salary || sourceSalary || null,
      specializations: target.specializations || [],
      employment: target.employment || null,
      schedule: target.schedule || null,
      workFormat: target.workFormat || null,
      commuteTime: target.commuteTime || null,
      keywordsUsed: filterSupportedKeywords(adapted.target.keywordsUsed, context),
    },
    adaptedResume: {
      ...adapted.adaptedResume,
      summary: sanitizeUnsupportedClaims(adapted.adaptedResume.summary, context),
      experience,
      skills: mergeSkills(original.adaptedResume.skills, adapted.adaptedResume.skills, context),
      education: original.adaptedResume.education,
      additionalInfo: [],
    },
  };
}

import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { AdaptedResumeSkills, ResumeAdaptationResult } from "./types.js";

type ExperienceItem = ResumeAdaptationResult["adaptedResume"]["experience"][number];
type CandidateGender = "female" | "male" | "unknown";

type SupportContext = {
  sourceText: string;
  sourceTextKey: string;
  originalSkills: string[];
  gender: CandidateGender;
  unsupportedClaims: string[];
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

const feminineVerbPairs: Array<[RegExp, string]> = [
  [/\bОсуществлял\b/giu, "Осуществляла"],
  [/\bосуществлял\b/giu, "осуществляла"],
  [/\bРазрабатывал\b/giu, "Разрабатывала"],
  [/\bразрабатывал\b/giu, "разрабатывала"],
  [/\bРазработал\b/giu, "Разработала"],
  [/\bразработал\b/giu, "разработала"],
  [/\bВел\b/giu, "Вела"],
  [/\bвел\b/giu, "вела"],
  [/\bВёл\b/giu, "Вела"],
  [/\bвёл\b/giu, "вела"],
  [/\bСоздавал\b/giu, "Создавала"],
  [/\bсоздавал\b/giu, "создавала"],
  [/\bСоздал\b/giu, "Создала"],
  [/\bсоздал\b/giu, "создала"],
  [/\bМонтировал\b/giu, "Монтировала"],
  [/\bмонтировал\b/giu, "монтировала"],
  [/\bГенерировал\b/giu, "Генерировала"],
  [/\bгенерировал\b/giu, "генерировала"],
  [/\bВзаимодействовал\b/giu, "Взаимодействовала"],
  [/\bвзаимодействовал\b/giu, "взаимодействовала"],
  [/\bАнализировал\b/giu, "Анализировала"],
  [/\bанализировал\b/giu, "анализировала"],
  [/\bВыявлял\b/giu, "Выявляла"],
  [/\bвыявлял\b/giu, "выявляла"],
  [/\bФормировал\b/giu, "Формировала"],
  [/\bформировал\b/giu, "формировала"],
  [/\bЗапускал\b/giu, "Запускала"],
  [/\bзапускал\b/giu, "запускала"],
  [/\bПодбирал\b/giu, "Подбирала"],
  [/\bподбирал\b/giu, "подбирала"],
  [/\bПисал\b/giu, "Писала"],
  [/\bписал\b/giu, "писала"],
  [/\bОрганизовывал\b/giu, "Организовывала"],
  [/\bорганизовывал\b/giu, "организовывала"],
  [/\bСнимал\b/giu, "Снимала"],
  [/\bснимал\b/giu, "снимала"],
  [/\bИспользовал\b/giu, "Использовала"],
  [/\bиспользовал\b/giu, "использовала"],
  [/\bОформлял\b/giu, "Оформляла"],
  [/\bоформлял\b/giu, "оформляла"],
  [/\bВерстал\b/giu, "Верстала"],
  [/\bверстал\b/giu, "верстала"],
  [/\bКоммуницировал\b/giu, "Коммуницировала"],
  [/\bкоммуницировал\b/giu, "коммуницировала"],
  [/\bПоддерживал\b/giu, "Поддерживала"],
  [/\bподдерживал\b/giu, "поддерживала"],
  [/\bКонтролировал\b/giu, "Контролировала"],
  [/\bконтролировал\b/giu, "контролировала"],
  [/\bСобирал\b/giu, "Собирала"],
  [/\bсобирал\b/giu, "собирала"],
  [/\bПланировал\b/giu, "Планировала"],
  [/\bпланировал\b/giu, "планировала"],
  [/\bАдаптировал\b/giu, "Адаптировала"],
  [/\bадаптировал\b/giu, "адаптировала"],
  [/\bУточнял\b/giu, "Уточняла"],
  [/\bуточнял\b/giu, "уточняла"],
  [/\bГотовил\b/giu, "Готовила"],
  [/\bготовил\b/giu, "готовила"],
  [/\bПрорабатывал\b/giu, "Прорабатывала"],
  [/\bпрорабатывал\b/giu, "прорабатывала"],
  [/\bОбрабатывал\b/giu, "Обрабатывала"],
  [/\bобрабатывал\b/giu, "обрабатывала"],
  [/\bОбеспечивал\b/giu, "Обеспечивала"],
  [/\bобеспечивал\b/giu, "обеспечивала"],
  [/\bСпроектировал\b/giu, "Спроектировала"],
  [/\bспроектировал\b/giu, "спроектировала"],
  [/\bВнедрил\b/giu, "Внедрила"],
  [/\bвнедрил\b/giu, "внедрила"],
  [/\bОптимизировал\b/giu, "Оптимизировала"],
  [/\bоптимизировал\b/giu, "оптимизировала"],
  [/\bРеализовал\b/giu, "Реализовала"],
  [/\bреализовал\b/giu, "реализовала"],
  [/\bСократил\b/giu, "Сократила"],
  [/\bсократил\b/giu, "сократила"],
  [/\bНастроил\b/giu, "Настроила"],
  [/\bнастроил\b/giu, "настроила"],
  [/\bПодключал\b/giu, "Подключала"],
  [/\bподключал\b/giu, "подключала"],
  [/\bНагражден\b/giu, "Награждена"],
  [/\bнагражден\b/giu, "награждена"],
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

function isNearDuplicate(a: string, b: string) {
  return similarity(a, b) >= 0.82;
}

function detectCandidateGender(sourceDocument: SourceResumeDocument): CandidateGender {
  const gender = clean(sourceDocument.personal.gender).toLowerCase();
  if (/жен|female|woman/u.test(gender)) return "female";
  if (/муж|male|man/u.test(gender)) return "male";

  const fullName = clean(sourceDocument.personal.fullName).toLowerCase();
  if (/(?:овна|евна|ична|инична)\b/u.test(fullName)) return "female";
  if (/(?:ович|евич)\b/u.test(fullName)) return "male";
  if (/\b[а-яё]+(?:ова|ева|ёва|ина|ая)\b/u.test(fullName)) return "female";
  if (/\b[а-яё]+(?:ов|ев|ёв|ин|ий|ый)\b/u.test(fullName)) return "male";

  return "unknown";
}

function applyGenderInflection(value: string, gender: CandidateGender) {
  let result = value;
  if (gender === "female") {
    for (const [pattern, replacement] of feminineVerbPairs) {
      result = result.replace(pattern, replacement);
    }
  }

  return result;
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

  const valueTokens = tokens(value);
  const supportedTokenCount = valueTokens.filter((token) => context.sourceTextKey.includes(token)).length;
  if (valueTokens.length > 0 && supportedTokenCount / valueTokens.length >= 0.65) {
    return true;
  }

  return context.originalSkills.some((skill) => key(skill) === itemKey || isSimilar(skill, value));
}

function isDanglingClaimText(value: string) {
  const text = clean(value).replace(/[.,;:]+$/u, "");

  return (
    !text ||
    /^(?:работа|навык|навыки|опыт|владение|знание)$/iu.test(text) ||
    /^(?:работа|навык|навыки|опыт|владение|знание)\s+(?:в|с|со|на|для)$/iu.test(text) ||
    /^(?:создание|разработка|ведение|подготовка|монтаж)\s*$/iu.test(text)
  );
}

function cleanupUnsupportedClaimText(value: string) {
  return value
    .replace(/\((?:\s*[,/;]?\s*)+\)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/,\s*([).])/g, "$1")
    .replace(/\s+,/g, ",")
    .replace(/(?:включая|в том числе)\s*[,.]?\s*([.)])/giu, "$1")
    .replace(/\b(?:в|на|для|через|с помощью|с)\s*[,.]/giu, ".")
    .replace(/\b(?:включая|в том числе)\s*$/giu, "")
    .replace(/\b(?:в|на|для|через|с помощью|с|со)\s*$/giu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .trim();
}

function removeUnsupportedClaim(value: string, claim: string) {
  const escaped = escapeRegExp(claim);
  return value
    .replace(new RegExp(`\\b${escaped}\\b`, "giu"), "")
    .replace(new RegExp(`(?:,|;|/)\\s*${escaped}\\s*(?:,|;|/)`, "giu"), ", ");
}

function sanitizeUnsupportedClaims(value: string, context: SupportContext) {
  let result = clean(value);

  for (const claim of context.unsupportedClaims) {
    if (!claim || isSupportedClaim(claim, context)) continue;
    result = removeUnsupportedClaim(result, claim);
  }

  const cleaned = cleanupUnsupportedClaimText(result);
  return isDanglingClaimText(cleaned) ? "" : cleaned;
}

function sanitizeResumeText(value: string, context: SupportContext) {
  return applyGenderInflection(sanitizeUnsupportedClaims(value, context), context.gender);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeResumeText(value: string) {
  return clean(value)
    .replace(/Abode Photoshop/giu, "Adobe Photoshop")
    .replace(/Google AI Stutio/giu, "Google AI Studio")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeSkillText(value: string, context: SupportContext) {
  return sanitizeResumeText(normalizeResumeText(value), context);
}

function polishBullet(value: string, context?: SupportContext) {
  const text = normalizeResumeText(value);
  return context ? sanitizeResumeText(text, context) : text;
}

function normalizeNotAddedValue(value: string) {
  return normalizeResumeText(value)
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта:?\s*/iu, "")
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Нет\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Опыт\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Работа\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Выдумывание\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Умение\s+создавать\s+/iu, "")
    .replace(/[.,;:]+$/u, "");
}

function normalizeNotAdded(items: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const normalized = normalizeNotAddedValue(item);
    const itemKey = key(normalized);
    if (!normalized || isDanglingClaimText(normalized) || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }

  return result;
}

function mergeBullets(original: string[], adapted: string[], context: SupportContext) {
  const originalItems = unique(original)
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .filter(Boolean);
  const adaptedItems = unique(adapted)
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .filter(Boolean);

  if (!originalItems.length) return unique(adaptedItems);
  if (!adaptedItems.length) return unique(originalItems);

  const targetCount = Math.min(Math.max(originalItems.length, adaptedItems.length), 16);
  const result = [...adaptedItems];
  const seen = new Set(result.map(key));

  for (const bullet of originalItems) {
    if (result.length >= targetCount) break;
    const bulletKey = key(bullet);
    if (seen.has(bulletKey) || result.some((item) => isNearDuplicate(item, bullet))) continue;
    seen.add(bulletKey);
    result.push(bullet);
  }

  return unique(result).slice(0, targetCount);
}

function mergeFocus(originalFocus: string | null, adaptedFocus: string | null | undefined, context: SupportContext) {
  const adapted = sanitizeResumeText(clean(adaptedFocus), context);
  if (adapted && !isSalaryLine(adapted)) return adapted;
  return unique(originalFocus?.split("\n") || [])
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .join("\n") || null;
}

function mergePreservedFacts(original: ExperienceItem, adapted: ExperienceItem | null, context: SupportContext) {
  return unique([...(adapted?.preservedFacts || []), ...original.adaptedBullets])
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .filter(Boolean)
    .slice(0, 16);
}

function mergeExperienceItem(
  original: ExperienceItem,
  adapted: ExperienceItem | null,
  context: SupportContext
): ExperienceItem {
  const adaptedBullets = adapted?.adaptedBullets || [];
  return {
    sourceIndex: original.sourceIndex,
    company: original.company,
    companyUrl: original.companyUrl,
    position: resolvePosition(original, adapted),
    dates: original.dates,
    adaptedBullets: mergeBullets(original.adaptedBullets, adaptedBullets, context),
    focus: mergeFocus(original.focus, adapted?.focus, context),
    preservedFacts: mergePreservedFacts(original, adapted, context),
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
  const normalized = normalizeSkillText(value, context);
  if (!normalized || isDanglingClaimText(normalized)) return null;

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

function normalizeAdditionalInfoItem(value: string, context: SupportContext) {
  const sanitized = sanitizeResumeText(normalizeResumeText(value), context);
  if (!sanitized || isDanglingClaimText(sanitized)) return null;
  return sanitized;
}

function mergeAdditionalInfo(original: string[], adapted: string[], context: SupportContext) {
  const adaptedItems = adapted
    .map((item) => normalizeAdditionalInfoItem(item, context))
    .filter((item): item is string => Boolean(item));
  const originalItems = original
    .map((item) => normalizeAdditionalInfoItem(item, context))
    .filter((item): item is string => Boolean(item));

  return unique([...adaptedItems, ...originalItems]).slice(0, 12);
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }

  return [];
}

function extractAtomicUnsupportedClaims(value: string) {
  return clean(value)
    .split(/[,:;/()\[\]{}]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && /[a-zа-яё0-9]/iu.test(item));
}

function createUnsupportedClaims(adapted: ResumeAdaptationResult) {
  const explicit = [
    ...adapted.adaptedResume.skills.notAdded,
    ...adapted.forbiddenClaims,
    ...adapted.warnings,
  ].flatMap((item) => [item, ...extractAtomicUnsupportedClaims(item)]);

  return unique(explicit.map(normalizeNotAddedValue)).filter(Boolean).slice(0, 80);
}

function createSupportContext(
  original: ResumeAdaptationResult,
  adapted: ResumeAdaptationResult,
  sourceDocument: SourceResumeDocument
): SupportContext {
  const originalSkills = createOriginalSkillPhrases(original.adaptedResume.skills);
  const sourceText = collectText(original).join("\n");

  return {
    sourceText,
    sourceTextKey: key(sourceText),
    originalSkills,
    gender: detectCandidateGender(sourceDocument),
    unsupportedClaims: createUnsupportedClaims(adapted),
  };
}

function filterSupportedKeywords(items: string[], context: SupportContext) {
  return unique(items)
    .map((item) => normalizeSkillText(item, context))
    .filter((item) => Boolean(item) && isSupportedClaim(item, context));
}

function isMarketingTitle(value: string) {
  return (
    /\b(?:опытн(?:ый|ая)|профессиональн(?:ый|ая)|сильн(?:ый|ая)|квалифицированн(?:ый|ая))\b/iu.test(value) ||
    /\bс\s+фокусом\s+на\b/iu.test(value) ||
    /\b(?:более\s+чем|летним\s+опытом|опыт\s+создания|экспертиза\s+в)\b/iu.test(value) ||
    clean(value).split(/\s+/u).length > 8
  );
}

function normalizeHeadline(value: string | null | undefined, context: SupportContext, fallbackTitle?: string | null) {
  const sourceTitle = normalizeResumeText(fallbackTitle || "");
  const sanitized = sanitizeResumeText(clean(value), context)
    .replace(/^Опытн(?:ый|ая)\s+/iu, "")
    .replace(/^Профессиональн(?:ый|ая)\s+/iu, "")
    .replace(/^Сильн(?:ый|ая)\s+/iu, "")
    .replace(/^Квалифицированн(?:ый|ая)\s+/iu, "");

  if (sourceTitle && (!sanitized || isMarketingTitle(sanitized))) return sourceTitle;
  return sanitized || sourceTitle;
}

function resolveTargetTitle(params: {
  sourceTitle?: string | null;
  adaptedTitle?: string | null;
  headline?: string | null;
  context: SupportContext;
}) {
  const sourceTitle = normalizeResumeText(params.sourceTitle || "");
  if (sourceTitle) return sourceTitle;

  const adaptedTitle = normalizeHeadline(params.adaptedTitle, params.context, sourceTitle);
  const headline = normalizeHeadline(params.headline, params.context, sourceTitle);

  return adaptedTitle || headline || null;
}

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = params.adaptation;
  const target = original.target;
  const context = createSupportContext(original, adapted, params.sourceDocument);
  const sourceSalary = collectExperienceSalary(original.adaptedResume.experience);
  const experience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(item, findAdapted(adapted.adaptedResume.experience, item.sourceIndex, index), context)
  );
  const headline = normalizeHeadline(adapted.adaptedResume.headline, context, target.title);

  return {
    ...adapted,
    target: {
      title: resolveTargetTitle({
        sourceTitle: target.title,
        adaptedTitle: adapted.target.title,
        headline,
        context,
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
      headline,
      summary: sanitizeResumeText(adapted.adaptedResume.summary, context),
      experience,
      skills: mergeSkills(original.adaptedResume.skills, adapted.adaptedResume.skills, context),
      education: original.adaptedResume.education,
      additionalInfo: mergeAdditionalInfo(
        original.adaptedResume.additionalInfo,
        adapted.adaptedResume.additionalInfo,
        context
      ),
    },
  };
}

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

function tokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-zа-яё0-9+#.]+/giu)
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
  return similarity(a, b) >= 0.58;
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

function mergeBullets(original: string[], adapted: string[], context: SupportContext) {
  const originalItems = unique(original).filter((item) => !isSalaryLine(item));
  const adaptedItems = unique(adapted)
    .filter((item) => !isSalaryLine(item))
    .map((item) => sanitizeUnsupportedClaims(item, context))
    .filter(Boolean);

  if (!originalItems.length) return adaptedItems;
  if (!adaptedItems.length) return originalItems;

  const targetCount = Math.min(originalItems.length, 16);
  const minimumUsefulAdaptedCount = Math.max(3, Math.ceil(originalItems.length * 0.45));

  if (adaptedItems.length >= minimumUsefulAdaptedCount) {
    return adaptedItems.slice(0, targetCount);
  }

  const result = [...adaptedItems];
  const seen = new Set(result.map(key));
  const fallbackCount = Math.max(result.length, Math.ceil(originalItems.length * 0.65));

  for (const bullet of originalItems) {
    if (result.length >= fallbackCount) break;
    const bulletKey = key(bullet);
    if (seen.has(bulletKey) || result.some((item) => isSimilar(item, bullet))) continue;
    seen.add(bulletKey);
    result.push(bullet);
  }

  return result.length ? result.slice(0, targetCount) : originalItems;
}

function mergeFocus(originalFocus: string | null, adaptedFocus: string | null | undefined, context: SupportContext) {
  const adapted = sanitizeUnsupportedClaims(clean(adaptedFocus), context);
  if (adapted && !isSalaryLine(adapted)) return adapted;
  return unique(originalFocus?.split("\n") || [])
    .filter((item) => !isSalaryLine(item))
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

function findSupportedSkill(value: string, originalSkills: string[]) {
  const valueKey = key(value);
  const exact = originalSkills.find((skill) => key(skill) === valueKey);
  if (exact) return exact;

  return originalSkills.some((skill) => isSimilar(skill, value)) ? clean(value) : null;
}

function mergeSkills(original: AdaptedResumeSkills, adapted: AdaptedResumeSkills) {
  const originalSkills = unique([...original.primary, ...original.secondary]);
  const addSupported = (items: string[]) =>
    unique(items)
      .map((item) => findSupportedSkill(item, originalSkills))
      .filter((item): item is string => Boolean(item));
  const primary = unique(addSupported([...adapted.primary, ...adapted.secondary]));
  const used = new Set(primary.map(key));
  const secondary = originalSkills.filter((skill) => !used.has(key(skill)));
  return {
    primary: primary.length ? primary : unique(original.primary),
    secondary,
    deprioritized: unique(adapted.deprioritized).filter((item) => Boolean(findSupportedSkill(item, originalSkills))),
    notAdded: unique(adapted.notAdded),
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
  const originalSkills = unique([
    ...original.adaptedResume.skills.primary,
    ...original.adaptedResume.skills.secondary,
  ]);
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
      title: target.title,
      company: adapted.target.company,
      seniority: adapted.target.seniority,
      salary: target.salary || adapted.target.salary || sourceSalary || null,
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
      skills: mergeSkills(original.adaptedResume.skills, adapted.adaptedResume.skills),
      education: original.adaptedResume.education,
      additionalInfo: [],
    },
  };
}

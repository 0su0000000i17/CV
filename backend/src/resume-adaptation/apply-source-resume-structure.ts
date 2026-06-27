import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { AdaptedResumeSkills, ResumeAdaptationResult } from "./types.js";

type ExperienceItem = ResumeAdaptationResult["adaptedResume"]["experience"][number];

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function key(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
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

function findAdapted(items: ExperienceItem[], sourceIndex: number, fallbackIndex: number) {
  return items.find((item) => item.sourceIndex === sourceIndex) || items[fallbackIndex] || null;
}

function mergeBullets(original: string[], adapted: string[]) {
  const result = unique(adapted);
  const seen = new Set(result.map(key));
  const targetCount = Math.min(unique(original).length, 16);

  for (const bullet of unique(original)) {
    if (result.length >= targetCount) break;
    const bulletKey = key(bullet);
    if (seen.has(bulletKey)) continue;
    seen.add(bulletKey);
    result.push(bullet);
  }

  return result.length ? result : unique(original);
}

function mergeExperienceItem(original: ExperienceItem, adapted: ExperienceItem | null): ExperienceItem {
  const adaptedBullets = adapted?.adaptedBullets || [];
  const preservedFacts = adapted?.preservedFacts?.length ? adapted.preservedFacts : original.preservedFacts;
  return {
    sourceIndex: original.sourceIndex,
    company: original.company,
    companyUrl: original.companyUrl,
    position: original.position,
    dates: original.dates,
    adaptedBullets: mergeBullets(original.adaptedBullets, adaptedBullets),
    focus: clean(adapted?.focus) || original.focus,
    preservedFacts: unique(preservedFacts).slice(0, 16),
    warnings: adapted?.warnings || [],
  };
}

function mergeSkills(original: AdaptedResumeSkills, adapted: AdaptedResumeSkills) {
  const originalSkills = unique([...original.primary, ...original.secondary]);
  const canonical = new Map(originalSkills.map((skill) => [key(skill), skill]));
  const addSupported = (items: string[]) =>
    unique(items)
      .map((item) => canonical.get(key(item)))
      .filter((item): item is string => Boolean(item));
  const primary = unique(addSupported([...adapted.primary, ...adapted.secondary]));
  const used = new Set(primary.map(key));
  const secondary = originalSkills.filter((skill) => !used.has(key(skill)));

  return {
    primary: primary.length ? primary : unique(original.primary),
    secondary,
    deprioritized: unique(adapted.deprioritized).filter((item) => canonical.has(key(item))),
    notAdded: unique(adapted.notAdded),
  };
}

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = params.adaptation;
  const target = original.target;
  const experience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(item, findAdapted(adapted.adaptedResume.experience, item.sourceIndex, index))
  );

  return {
    ...adapted,
    target: {
      title: target.title,
      company: adapted.target.company,
      seniority: adapted.target.seniority,
      salary: target.salary || null,
      specializations: target.specializations || [],
      employment: target.employment || null,
      schedule: target.schedule || null,
      workFormat: target.workFormat || null,
      commuteTime: target.commuteTime || null,
      keywordsUsed: unique(adapted.target.keywordsUsed),
    },
    adaptedResume: {
      ...adapted.adaptedResume,
      experience,
      skills: mergeSkills(original.adaptedResume.skills, adapted.adaptedResume.skills),
      education: original.adaptedResume.education,
      additionalInfo: [],
    },
  };
}

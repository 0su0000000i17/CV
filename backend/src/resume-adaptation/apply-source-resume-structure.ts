import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { ResumeAdaptationResult } from "./types.js";

type ExperienceItem = ResumeAdaptationResult["adaptedResume"]["experience"][number];

function findAdaptedExperience(
  adaptedItems: ExperienceItem[],
  sourceIndex: number,
  fallbackIndex: number
) {
  return (
    adaptedItems.find((item) => item.sourceIndex === sourceIndex) ||
    adaptedItems[fallbackIndex] ||
    null
  );
}

function mergeExperienceItem(
  original: ExperienceItem,
  adapted: ExperienceItem | null
): ExperienceItem {
  const adaptedBullets = adapted?.adaptedBullets?.filter(Boolean) || [];
  const preservedFacts = adapted?.preservedFacts?.filter(Boolean) || [];

  return {
    sourceIndex: original.sourceIndex,
    company: original.company,
    companyUrl: original.companyUrl,
    position: original.position,
    dates: original.dates,
    adaptedBullets: adaptedBullets.length ? adaptedBullets : original.adaptedBullets,
    focus: adapted?.focus || original.focus,
    preservedFacts: preservedFacts.length ? preservedFacts : original.preservedFacts,
    warnings: adapted?.warnings || [],
  };
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = params.adaptation;

  const experience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(
      item,
      findAdaptedExperience(adapted.adaptedResume.experience, item.sourceIndex, index)
    )
  );

  return {
    ...adapted,
    target: {
      ...original.target,
      company: adapted.target.company,
      seniority: adapted.target.seniority,
      keywordsUsed: adapted.target.keywordsUsed,
    },
    adaptedResume: {
      ...adapted.adaptedResume,
      experience,
      skills: {
        primary: unique([
          ...adapted.adaptedResume.skills.primary,
          ...original.adaptedResume.skills.primary,
        ]),
        secondary: unique(adapted.adaptedResume.skills.secondary),
        deprioritized: unique(adapted.adaptedResume.skills.deprioritized),
        notAdded: unique(adapted.adaptedResume.skills.notAdded),
      },
      education: original.adaptedResume.education,
      additionalInfo: original.adaptedResume.additionalInfo,
    },
  };
}

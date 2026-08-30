import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { ResumeAdaptationResult } from "./types.js";
import { mergeAdditionalInfo } from "./source-structure/additional-info.js";
import { dedupeCrossPlaceBullets } from "./source-structure/cross-place-dedupe.js";
import { mergeExperienceItem } from "./source-structure/experience-merge.js";
import {
  collectExperienceSalary,
  findAdapted,
} from "./source-structure/experience-matching.js";
import {
  filterSupportedKeywords,
  normalizeHeadline,
  resolveTargetTitle,
} from "./source-structure/headline.js";
import { sanitizeResumeText } from "./source-structure/resume-text.js";
import { mergeSkills } from "./source-structure/skill-merge.js";
import { createSupportContext } from "./source-structure/support-context.js";
import { unique } from "./source-structure/text-core.js";

export { applyGenderInflection } from "./source-structure/gender-inflection.js";
export { mergePreservingSourceBullets } from "./source-structure/bullet-merge.js";

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
  confirmedFacts?: string[];
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = dedupeCrossPlaceBullets(params.adaptation);
  const target = original.target;
  const context = createSupportContext(
    original,
    adapted,
    params.sourceDocument,
    params.confirmedFacts,
  );
  const sourceSalary = collectExperienceSalary(original.adaptedResume.experience);
  const mergedExperience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(
      item,
      findAdapted(adapted.adaptedResume.experience, item.sourceIndex, index),
      context,
      params.sourceDocument.experience.items[index]?.blocks || [],
    ),
  );
  const headline = normalizeHeadline(
    adapted.adaptedResume.headline,
    context,
    target.title,
  );

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
      experience: mergedExperience.map((result) => result.item),
      skills: mergeSkills(
        original.adaptedResume.skills,
        adapted.adaptedResume.skills,
        context,
      ),
      education: original.adaptedResume.education,
      additionalInfo: mergeAdditionalInfo(
        original.adaptedResume.additionalInfo,
        adapted.adaptedResume.additionalInfo,
        context,
      ),
    },
    metricGaps: unique(
      mergedExperience.flatMap((result) => result.metricGaps),
    ).slice(0, 10),
  };
}

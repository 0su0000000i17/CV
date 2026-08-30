import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { SourceResumeDocument } from '@/src/shared/api/resumes.types';

import { normalizeExperienceItems } from './normalizer/experience';
import { collectSourceLanguageKeys, collectSourceSkillKeys } from './normalizer/source-skills';
import { normalizeEditorSkills } from './normalizer/skills';
import { normalizeStringList, normalizeTextValue } from './normalizer/text';

type NormalizeResumeEditorDraftOptions = {
  sourceDocument?: SourceResumeDocument | null;
};

export function normalizeResumeEditorDraft(
  draft: ResumeAdaptationResult,
  options: NormalizeResumeEditorDraftOptions = {}
): ResumeAdaptationResult {
  const headline = normalizeTextValue(draft.adaptedResume.headline) || 'Резюме';
  const normalizedExperience = normalizeExperienceItems(draft.adaptedResume.experience);
  const normalizedSkills = normalizeEditorSkills(
    [
      ...draft.adaptedResume.skills.primary,
      ...draft.adaptedResume.skills.secondary,
      ...draft.adaptedResume.skills.deprioritized,
    ],
    collectSourceLanguageKeys(options.sourceDocument),
    collectSourceSkillKeys(options.sourceDocument)
  );
  return {
    ...draft,
    target: {
      title: normalizeTextValue(draft.target.title) || headline,
      company: normalizeTextValue(draft.target.company),
      seniority: normalizeTextValue(draft.target.seniority),
      salary: normalizeTextValue(draft.target.salary) || normalizedExperience.salaryCandidates[0] || null,
      specializations: normalizeStringList(draft.target.specializations),
      employment: normalizeTextValue(draft.target.employment),
      schedule: normalizeTextValue(draft.target.schedule),
      workFormat: normalizeTextValue(draft.target.workFormat),
      commuteTime: normalizeTextValue(draft.target.commuteTime),
      keywordsUsed: normalizeStringList(draft.target.keywordsUsed),
    },
    adaptedResume: {
      headline,
      summary: normalizeTextValue(draft.adaptedResume.summary) || '',
      skills: {
        primary: normalizedSkills,
        secondary: [],
        deprioritized: [],
        notAdded: normalizeStringList(draft.adaptedResume.skills.notAdded),
      },
      experience: normalizedExperience.items,
      education: {
        policy: draft.adaptedResume.education.policy,
        notes: normalizeStringList(draft.adaptedResume.education.notes),
      },
      additionalInfo: normalizeStringList(draft.adaptedResume.additionalInfo),
    },
    changes: normalizeStringList(draft.changes),
    warnings: normalizeStringList(draft.warnings),
    forbiddenClaims: normalizeStringList(draft.forbiddenClaims),
  };
}

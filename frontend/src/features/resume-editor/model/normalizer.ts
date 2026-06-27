import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { normalizeCompanyUrl } from './text';

export function normalizeResumeEditorDraft(
  draft: ResumeAdaptationResult
): ResumeAdaptationResult {
  const headline = normalizeTextValue(draft.adaptedResume.headline) || 'Резюме';

  return {
    ...draft,
    target: {
      title: normalizeTextValue(draft.target.title) || headline,
      company: normalizeTextValue(draft.target.company),
      seniority: normalizeTextValue(draft.target.seniority),
      salary: normalizeTextValue(draft.target.salary),
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
        primary: normalizeStringList(draft.adaptedResume.skills.primary),
        secondary: normalizeStringList(draft.adaptedResume.skills.secondary),
        deprioritized: normalizeStringList(draft.adaptedResume.skills.deprioritized),
        notAdded: normalizeStringList(draft.adaptedResume.skills.notAdded),
      },
      experience: draft.adaptedResume.experience.map((item, index) => ({
        sourceIndex: Number.isFinite(Number(item.sourceIndex))
          ? Number(item.sourceIndex)
          : index,
        company: normalizeTextValue(item.company),
        companyUrl: normalizeCompanyUrl(item.companyUrl),
        position: normalizeTextValue(item.position),
        dates: normalizeTextValue(item.dates),
        focus: normalizeTextValue(item.focus),
        adaptedBullets: normalizeStringList(item.adaptedBullets),
        preservedFacts: normalizeStringList(item.preservedFacts),
        warnings: normalizeStringList(item.warnings),
      })),
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

function normalizeTextValue(value?: string | null) {
  return value?.trim() || null;
}

function normalizeStringList(value: string[] = []) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

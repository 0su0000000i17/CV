import type {
  AdaptedResumeExperienceItem,
  ResumeAdaptationResult,
} from '@/src/shared/api/resume-adaptation';

import { normalizeCompanyUrl } from './text';

type NormalizedExperienceResult = {
  items: AdaptedResumeExperienceItem[];
  salaryCandidates: string[];
};

export function normalizeResumeEditorDraft(
  draft: ResumeAdaptationResult
): ResumeAdaptationResult {
  const headline = normalizeTextValue(draft.adaptedResume.headline) || 'Резюме';
  const normalizedExperience = normalizeExperienceItems(
    draft.adaptedResume.experience
  );
  const targetSalary =
    normalizeTextValue(draft.target.salary) ||
    pickBestSalary(normalizedExperience.salaryCandidates);

  return {
    ...draft,
    target: {
      title: normalizeTextValue(draft.target.title) || headline,
      company: normalizeTextValue(draft.target.company),
      seniority: normalizeTextValue(draft.target.seniority),
      salary: targetSalary,
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

function normalizeExperienceItems(
  items: AdaptedResumeExperienceItem[]
): NormalizedExperienceResult {
  const salaryCandidates: string[] = [];

  const normalizedItems = items.map((item, index) => {
    const position = normalizeTextValue(item.position);
    const focus = normalizeTextValue(item.focus);
    const positionSalary = extractStandaloneSalary(position);
    const focusSalary = extractStandaloneSalary(focus);

    if (positionSalary) salaryCandidates.push(positionSalary);
    if (focusSalary) salaryCandidates.push(focusSalary);

    const adaptedBullets = normalizeStringList(item.adaptedBullets).filter(
      (bullet) => {
        const salary = extractStandaloneSalary(bullet);

        if (salary) {
          salaryCandidates.push(salary);
          return false;
        }

        return true;
      }
    );

    return {
      sourceIndex: Number.isFinite(Number(item.sourceIndex))
        ? Number(item.sourceIndex)
        : index,
      company: normalizeTextValue(item.company),
      companyUrl: normalizeCompanyUrl(item.companyUrl),
      position: positionSalary ? null : position,
      dates: normalizeTextValue(item.dates),
      focus: focusSalary ? null : focus,
      adaptedBullets,
      preservedFacts: normalizeStringList(item.preservedFacts),
      warnings: normalizeStringList(item.warnings),
    };
  });

  return { items: normalizedItems, salaryCandidates };
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

function extractSalaryCandidates(value?: string | null) {
  const text = value || '';

  return Array.from(
    text.matchAll(
      /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/giu
    )
  )
    .map((match) => normalizeTextValue(match[0]))
    .filter((item): item is string => Boolean(item));
}

function extractStandaloneSalary(value?: string | null) {
  const text = normalizeTextValue(value);

  if (!text) return null;

  const candidates = extractSalaryCandidates(text);

  return (
    candidates.find((candidate) => {
      const normalizedText = text.replace(/[.,;:]$/u, '');

      return (
        normalizedText === candidate ||
        normalizedText.length <= candidate.length + 14
      );
    }) || null
  );
}

function salaryDigits(value: string) {
  return value.replace(/\D/g, '');
}

function pickBestSalary(candidates: string[]) {
  const uniqueCandidates = normalizeStringList(candidates);
  const firstCandidate = uniqueCandidates[0] || null;

  if (!firstCandidate) return null;

  const firstDigits = salaryDigits(firstCandidate);
  const richerCandidate = uniqueCandidates.find((candidate) => {
    const digits = salaryDigits(candidate);

    return (
      digits &&
      firstDigits &&
      digits === firstDigits &&
      /(на руки|net|gross|до вычета|после вычета)/i.test(candidate)
    );
  });

  return richerCandidate || firstCandidate;
}

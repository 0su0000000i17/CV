import type { AdaptedResumeExperienceItem } from '@/src/shared/api/resume-adaptation';
import { normalizeCompanyUrl } from '../text';
import { extractStandaloneSalary } from './salary';
import { normalizeMultilineValue, normalizeStringList, normalizeTextValue } from './text';

export function normalizeExperienceItems(items: AdaptedResumeExperienceItem[]) {
  const salaryCandidates: string[] = [];
  const normalizedItems = items.map((item, index) => {
    const position = normalizeTextValue(item.position);
    const focus = normalizeTextValue(item.focus);
    const positionSalary = extractStandaloneSalary(position);
    const focusSalary = extractStandaloneSalary(focus);
    if (positionSalary) salaryCandidates.push(positionSalary);
    if (focusSalary) salaryCandidates.push(focusSalary);
    const adaptedBullets = normalizeStringList(item.adaptedBullets).filter((bullet) => {
      const salary = extractStandaloneSalary(bullet);
      if (!salary) return true;
      salaryCandidates.push(salary);
      return false;
    });
    return {
      sourceIndex: Number.isFinite(Number(item.sourceIndex)) ? Number(item.sourceIndex) : index,
      company: normalizeTextValue(item.company),
      companyCity: normalizeTextValue(item.companyCity),
      companyUrl: normalizeCompanyUrl(item.companyUrl),
      companyIndustries: normalizeStringList(item.companyIndustries),
      position: positionSalary ? null : position,
      dates: normalizeTextValue(item.dates),
      description: normalizeMultilineValue(item.description),
      focus: focusSalary ? null : focus,
      adaptedBullets,
      preservedFacts: normalizeStringList(item.preservedFacts),
      warnings: normalizeStringList(item.warnings),
    };
  });
  return { items: normalizedItems, salaryCandidates };
}

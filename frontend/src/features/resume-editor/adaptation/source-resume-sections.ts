import type { UploadedResume } from '@/src/shared/api/resumes';

import type { SourceExperience } from './change-explanation-types';
import { experienceText, isRecord, stringList, stringValue } from './change-explanation-utils';

function sourceBlockText(value: unknown) {
  if (!isRecord(value)) return '';
  if (value.type === 'stack') {
    return [stringValue(value.label), stringValue(value.raw)].filter(Boolean).join(': ');
  }
  return stringValue(value.text) || stringValue(value.title);
}

export function readSourceExperience(resume?: UploadedResume): SourceExperience[] {
  const editable = resume?.editable_resume_json;
  if (editable) {
    return editable.adaptedResume.experience.map((item) => ({
      sourceIndex: item.sourceIndex,
      company: item.company || '',
      position: item.position || '',
      text: experienceText(item),
    }));
  }

  const document = resume?.source_resume_document;
  if (!isRecord(document) || !isRecord(document.experience)) return [];
  const items = Array.isArray(document.experience.items) ? document.experience.items : [];
  return items.flatMap((rawItem, index) => {
    if (!isRecord(rawItem)) return [];
    const company = isRecord(rawItem.company) ? stringValue(rawItem.company.name) : '';
    const blocks = Array.isArray(rawItem.blocks) ? rawItem.blocks : [];
    return [{
      sourceIndex: Number.isFinite(Number(rawItem.sourceIndex)) ? Number(rawItem.sourceIndex) : index,
      company,
      position: stringValue(rawItem.position),
      text: blocks.map(sourceBlockText).filter(Boolean).join('\n'),
    }];
  });
}

export function readSourceSummary(resume?: UploadedResume) {
  const editable = resume?.editable_resume_json;
  if (editable) return editable.adaptedResume.summary || '';
  const document = resume?.source_resume_document;
  if (!isRecord(document) || !isRecord(document.additional)) return '';
  return stringList(document.additional.about).join('\n');
}

export function readSourceSkills(resume?: UploadedResume) {
  const editable = resume?.editable_resume_json;
  if (editable) {
    return [
      ...editable.adaptedResume.skills.primary,
      ...editable.adaptedResume.skills.secondary,
      ...editable.adaptedResume.skills.deprioritized,
    ];
  }
  const document = resume?.source_resume_document;
  if (!isRecord(document) || !isRecord(document.skills)) return [];
  return stringList(document.skills.items);
}

import { useState } from 'react';

import type { DraftUpdater } from '@/src/features/resume-editor/model/types';

import {
  createWorkDescription,
  formatWorkDates,
  parseWorkDates,
  type EditableWorkField,
  type WorkItemEditDraft,
} from './work-edit-values';

export function useWorkEditForm(item: WorkItemEditDraft, index: number, updateDraft: DraftUpdater) {
  const [formState, setFormState] = useState(() => ({
    company: item.company || '',
    companyCity: item.companyCity || '',
    companyUrl: item.companyUrl || '',
    companyIndustries: (item.companyIndustries || []).join('\n'),
    position: item.position || '',
    description: createWorkDescription(item),
    dates: parseWorkDates(item.dates),
  }));

  function updateField(field: EditableWorkField, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];
      if (entry) entry[field] = value.trim() || null;
    });
  }

  function updateIndustries(value: string) {
    setFormState((current) => ({ ...current, companyIndustries: value }));
    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];
      if (!entry) return;
      entry.companyIndustries = value.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
    });
  }

  function updateDescription(value: string) {
    setFormState((current) => ({ ...current, description: value }));
    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];
      if (entry) entry.description = value.trim() || null;
    });
  }

  function updateDateField(field: keyof ReturnType<typeof parseWorkDates>, value: string | boolean) {
    const dates = { ...formState.dates, [field]: value };
    setFormState((current) => ({ ...current, dates }));
    updateDraft((draft) => {
      const entry = draft.adaptedResume.experience[index];
      if (entry) entry.dates = formatWorkDates(dates) || null;
    });
  }

  return { formState, updateDateField, updateDescription, updateField, updateIndustries };
}

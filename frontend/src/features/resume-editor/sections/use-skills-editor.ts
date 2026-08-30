import { useState, type KeyboardEvent } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';

import { normalizeSkills, splitSkillInput } from './skill-values';

export function useSkillsEditor(params: {
  draft: ResumeAdaptationResult;
  setIsEditing: (value: boolean) => void;
  updateDraft: DraftUpdater;
}) {
  const [inputValue, setInputValue] = useState('');
  const skills = normalizeSkills([
    ...params.draft.adaptedResume.skills.primary,
    ...params.draft.adaptedResume.skills.secondary,
  ]);

  function saveSkills(nextSkills: string[]) {
    const normalized = normalizeSkills(nextSkills);
    params.updateDraft((current) => {
      current.adaptedResume.skills.primary = normalized;
      current.adaptedResume.skills.secondary = [];
      current.adaptedResume.skills.deprioritized = normalizeSkills(
        current.adaptedResume.skills.deprioritized
      );
    });
  }

  function addSkillsFromInput() {
    const nextItems = splitSkillInput(inputValue);
    if (!nextItems.length) return;
    saveSkills([...skills, ...nextItems]);
    setInputValue('');
  }

  function removeSkill(index: number) {
    saveSkills(skills.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (['Enter', ',', 'Tab'].includes(event.key) && inputValue.trim()) {
      event.preventDefault();
      addSkillsFromInput();
    }
    if (event.key === 'Backspace' && !inputValue && skills.length) {
      removeSkill(skills.length - 1);
    }
  }

  function finishEditing() {
    addSkillsFromInput();
    params.setIsEditing(false);
  }

  return {
    addSkillsFromInput,
    finishEditing,
    handleInputKeyDown,
    inputValue,
    removeSkill,
    setInputValue,
    skills,
  };
}

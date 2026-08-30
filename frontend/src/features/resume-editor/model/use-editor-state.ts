'use client';

import { useCallback, useMemo, useState } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { normalizeContacts } from './editor-defaults';
import { createPlainResumeText } from './serializer';
import { cloneAdaptation } from './text';
import type { AdaptationResultCardProps, ContactDraft } from './types';
import { useCopyResumeText } from './use-copy-resume-text';
import { useEditorHydration } from './use-editor-hydration';

type Params = Pick<AdaptationResultCardProps, 'adaptationResponse' | 'profileExtraction' | 'sourceResume'> & {
  initialDraft?: ResumeAdaptationResult | null;
  initialContacts?: Partial<ContactDraft> | null;
  initialPhotoUrl?: string | null;
  resetKey?: string;
};

export function useEditorState(params: Params) {
  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>(normalizeContacts(params.initialContacts));
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [expandedExperienceIndexes, setExpandedExperienceIndexes] = useState<number[]>([]);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const plainResumeText = useMemo(
    () => draft ? createPlainResumeText(draft, contacts) : '',
    [contacts, draft]
  );
  const copy = useCopyResumeText(plainResumeText);

  const resetEditorUi = useCallback(() => {
    setEditingExperienceIndex(null);
    setExpandedExperienceIndexes([]);
    setIsSkillsEditing(false);
    setIsAboutEditing(false);
  }, []);

  useEditorHydration({
    ...params,
    resetCopyStatus: copy.resetCopyStatus,
    resetEditorUi,
    setContacts,
    setDraft,
    setPhotoUrl,
  });

  function updateDraft(updater: (current: ResumeAdaptationResult) => void) {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneAdaptation(current);
      updater(next);
      return next;
    });
  }

  function toggleExpandedExperience(index: number) {
    setExpandedExperienceIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  return {
    contacts,
    copyResumeText: copy.copyResumeText,
    copyStatus: copy.copyStatus,
    draft,
    editingExperienceIndex,
    expandedExperienceIndexes,
    isAboutEditing,
    isSkillsEditing,
    photoUrl,
    plainResumeText,
    setContacts,
    setEditingExperienceIndex,
    setIsAboutEditing,
    setIsSkillsEditing,
    setPhotoUrl,
    toggleExpandedExperience,
    updateDraft,
  };
}

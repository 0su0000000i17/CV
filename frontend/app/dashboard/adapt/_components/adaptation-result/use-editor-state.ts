'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { AdaptationResultCardProps, ContactDraft } from './types';
import { cloneAdaptation, createPlainResumeText } from './utils';

export function useEditorState(
  adaptationResponse: AdaptationResultCardProps['adaptationResponse']
) {
  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
  });
  const [expandedExperienceIndexes, setExpandedExperienceIndexes] = useState<
    number[]
  >([]);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);
  const [isContactsEditing, setIsContactsEditing] = useState(false);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [isEducationEditing, setIsEducationEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  useEffect(() => {
    if (!adaptationResponse?.adaptation) {
      setDraft(null);
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
    setExpandedExperienceIndexes([]);
    setEditingExperienceIndex(null);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
  }, [adaptationResponse]);

  const plainResumeText = useMemo(() => {
    if (!draft) {
      return '';
    }

    return createPlainResumeText(draft, contacts);
  }, [contacts, draft]);

  function updateDraft(updater: (current: ResumeAdaptationResult) => void) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const next = cloneAdaptation(current);
      updater(next);

      return next;
    });
  }

  function resetDraftToAiVersion() {
    if (!adaptationResponse?.adaptation) {
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
  }

  function toggleExpandedExperience(index: number) {
    setExpandedExperienceIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  async function copyResumeText() {
    try {
      await navigator.clipboard.writeText(plainResumeText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    } finally {
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    }
  }

  return {
    draft,
    contacts,
    copyStatus,
    editingExperienceIndex,
    expandedExperienceIndexes,
    isAboutEditing,
    isContactsEditing,
    isEducationEditing,
    isSkillsEditing,
    copyResumeText,
    resetDraftToAiVersion,
    setContacts,
    setEditingExperienceIndex,
    setIsAboutEditing,
    setIsContactsEditing,
    setIsEducationEditing,
    setIsSkillsEditing,
    toggleExpandedExperience,
    updateDraft,
  };
}

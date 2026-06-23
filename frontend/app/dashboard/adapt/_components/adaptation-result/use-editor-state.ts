'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { AdaptationResultCardProps, ContactDraft } from './types';
import { extractSourceResumeData } from './source-resume-data';
import { cloneAdaptation, createPlainResumeText } from './utils';

const emptyContacts: ContactDraft = {
  fullName: '',
  gender: '',
  age: '',
  birthDate: '',
  phone: '',
  email: '',
  city: '',
  citizenship: '',
  workPermit: '',
  relocation: '',
  businessTrips: '',
};

export function useEditorState(
  adaptationResponse: AdaptationResultCardProps['adaptationResponse'],
  sourceResume: AdaptationResultCardProps['sourceResume']
) {
  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>(emptyContacts);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);
  const [expandedExperienceIndexes, setExpandedExperienceIndexes] = useState<
    number[]
  >([]);
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

    const sourceData = extractSourceResumeData(sourceResume);

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
    setContacts(sourceData.contacts);
    setPhotoUrl(sourceData.photoUrl);
    setEditingExperienceIndex(null);
    setExpandedExperienceIndexes([]);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
  }, [adaptationResponse, sourceResume]);

  const plainResumeText = useMemo(() => {
    return draft ? createPlainResumeText(draft, contacts) : '';
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
    photoUrl,
    copyStatus,
    editingExperienceIndex,
    expandedExperienceIndexes,
    isAboutEditing,
    isContactsEditing,
    isEducationEditing,
    isSkillsEditing,
    copyResumeText,
    setContacts,
    setEditingExperienceIndex,
    setIsAboutEditing,
    setIsContactsEditing,
    setIsEducationEditing,
    setIsSkillsEditing,
    setPhotoUrl,
    toggleExpandedExperience,
    updateDraft,
  };
}
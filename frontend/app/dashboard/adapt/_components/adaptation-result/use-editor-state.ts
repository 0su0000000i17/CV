'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

export function useEditorState({
  adaptationResponse,
  profileExtraction,
  sourceResume,
}: Pick<
  AdaptationResultCardProps,
  'adaptationResponse' | 'profileExtraction' | 'sourceResume'
>) {
  const appliedAdaptationRef = useRef<ResumeAdaptationResult | null>(null);
  const copyStatusTimeoutRef = useRef<number | null>(null);

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
    return () => {
      if (copyStatusTimeoutRef.current !== null) {
        window.clearTimeout(copyStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const nextAdaptation = adaptationResponse?.adaptation ?? null;

    if (!nextAdaptation) {
      appliedAdaptationRef.current = null;
      setDraft(null);
      return;
    }

    if (appliedAdaptationRef.current === nextAdaptation) {
      return;
    }

    appliedAdaptationRef.current = nextAdaptation;
    setDraft(cloneAdaptation(nextAdaptation));
    setEditingExperienceIndex(null);
    setExpandedExperienceIndexes([]);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
    setCopyStatus('idle');
  }, [adaptationResponse?.adaptation]);

  useEffect(() => {
    const sourceData = extractSourceResumeData(sourceResume, profileExtraction);

    setContacts(sourceData.contacts);
    setPhotoUrl(sourceData.photoUrl);
  }, [profileExtraction, sourceResume?.id]);

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
    if (copyStatusTimeoutRef.current !== null) {
      window.clearTimeout(copyStatusTimeoutRef.current);
      copyStatusTimeoutRef.current = null;
    }

    try {
      await navigator.clipboard.writeText(plainResumeText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }

    copyStatusTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      copyStatusTimeoutRef.current = null;
    }, 1800);
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
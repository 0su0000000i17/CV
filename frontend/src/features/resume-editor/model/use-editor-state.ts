'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { extractSourceResumeData } from './source-resume-data';
import type {
  AdaptationResultCardProps,
  ContactDraft,
} from './types';
import { createPlainResumeText } from './serializer';
import { cloneAdaptation } from './text';

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

type Params = Pick<
  AdaptationResultCardProps,
  'adaptationResponse' | 'profileExtraction' | 'sourceResume'
> & {
  initialDraft?: ResumeAdaptationResult | null;
  initialContacts?: Partial<ContactDraft> | null;
  resetKey?: string;
};

function normalizeContacts(value?: Partial<ContactDraft> | null): ContactDraft {
  return {
    ...emptyContacts,
    ...value,
  };
}

export function useEditorState({
  adaptationResponse,
  profileExtraction,
  sourceResume,
  initialDraft = null,
  initialContacts = null,
  resetKey,
}: Params) {
  const appliedDraftRef = useRef<ResumeAdaptationResult | null>(null);
  const copyStatusTimeoutRef = useRef<number | null>(null);

  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>(
    normalizeContacts(initialContacts)
  );
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
    const nextDraft = adaptationResponse?.adaptation ?? initialDraft;

    if (!nextDraft) {
      appliedDraftRef.current = null;
      setDraft(null);
      return;
    }

    if (appliedDraftRef.current === nextDraft) return;

    appliedDraftRef.current = nextDraft;
    setDraft(cloneAdaptation(nextDraft));
    setEditingExperienceIndex(null);
    setExpandedExperienceIndexes([]);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
    setCopyStatus('idle');
  }, [adaptationResponse?.adaptation, initialDraft, resetKey]);

  useEffect(() => {
    if (initialContacts) {
      setContacts(normalizeContacts(initialContacts));
      return;
    }

    const sourceData = extractSourceResumeData(sourceResume, profileExtraction);

    setContacts(sourceData.contacts);
    setPhotoUrl(sourceData.photoUrl);
  }, [
    initialContacts,
    profileExtraction,
    sourceResume?.id,
    sourceResume?.extracted_text,
  ]);

  const plainResumeText = useMemo(() => {
    return draft ? createPlainResumeText(draft, contacts) : '';
  }, [contacts, draft]);

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
    plainResumeText,
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

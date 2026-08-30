import { useEffect, useRef } from 'react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { normalizeResumeEditorDraft } from './normalizer';
import { extractSourceResumeData } from './source-resume-data';
import { cloneAdaptation } from './text';
import type { ContactDraft, AdaptationResultCardProps } from './types';
import { normalizeContacts } from './editor-defaults';

type Params = Pick<AdaptationResultCardProps, 'adaptationResponse' | 'profileExtraction' | 'sourceResume'> & {
  initialContacts?: Partial<ContactDraft> | null;
  initialDraft?: ResumeAdaptationResult | null;
  initialPhotoUrl?: string | null;
  resetCopyStatus: () => void;
  resetEditorUi: () => void;
  resetKey?: string;
  setContacts: (contacts: ContactDraft) => void;
  setDraft: (draft: ResumeAdaptationResult | null) => void;
  setPhotoUrl: (url: string | null) => void;
};

export function useEditorHydration(params: Params) {
  const appliedDraftRef = useRef<ResumeAdaptationResult | null>(null);
  const {
    adaptationResponse,
    initialContacts,
    initialDraft,
    initialPhotoUrl,
    profileExtraction,
    resetCopyStatus,
    resetEditorUi,
    resetKey,
    setContacts,
    setDraft,
    setPhotoUrl,
    sourceResume,
  } = params;

  useEffect(() => {
    const nextDraft = adaptationResponse?.adaptation ?? initialDraft;
    if (!nextDraft) {
      appliedDraftRef.current = null;
      setDraft(null);
      return;
    }
    if (appliedDraftRef.current === nextDraft) return;
    appliedDraftRef.current = nextDraft;
    setDraft(normalizeResumeEditorDraft(cloneAdaptation(nextDraft), {
      sourceDocument: sourceResume?.source_resume_document,
    }));
    resetEditorUi();
    resetCopyStatus();
  }, [
    adaptationResponse?.adaptation,
    initialDraft,
    resetCopyStatus,
    resetEditorUi,
    resetKey,
    setDraft,
    sourceResume?.source_resume_document,
  ]);

  useEffect(() => {
    if (initialContacts) {
      setContacts(normalizeContacts(initialContacts));
      setPhotoUrl(initialPhotoUrl ?? null);
      return;
    }
    const sourceData = extractSourceResumeData(sourceResume, profileExtraction);
    setContacts(sourceData.contacts);
    setPhotoUrl(sourceData.photoUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialContacts,
    initialPhotoUrl,
    profileExtraction,
    sourceResume?.id,
    sourceResume?.extracted_text,
  ]);
}

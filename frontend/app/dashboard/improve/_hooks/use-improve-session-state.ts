'use client';

import { useCallback, useState } from 'react';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-improvement';
import type { ResumeProfileExtractionResponse } from '@/src/shared/api/resumes';

const STORAGE_KEY = 'cvmatch-improve-session-v1';

export type ImproveSessionState = {
  selectedResumeId?: string;
  activeImprovementResumeId?: string | null;
  improvementResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
};

function readState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ImproveSessionState) : null;
  } catch {
    return null;
  }
}

function writeState(value: ImproveSessionState | null) {
  if (typeof window === 'undefined') return;
  if (!value) window.sessionStorage.removeItem(STORAGE_KEY);
  else window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function useImproveSessionState() {
  const [state, setState] = useState<ImproveSessionState | null>(() => readState());

  const saveState = useCallback((value: ImproveSessionState) => {
    setState(value);
    writeState(value);
  }, []);

  const clearState = useCallback(() => {
    setState(null);
    writeState(null);
  }, []);

  return {
    state,
    saveState,
    clearState,
  };
}

'use client';

import { useCallback, useState } from 'react';

import type {
  AdaptationSettings,
  ResumeAdaptationResponse,
} from '@/src/shared/api/resume-adaptation';
import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';

const STORAGE_KEY = 'cvpro-adapt-session-v1';

export type AdaptSessionState = {
  selectedResumeId?: string;
  vacancyInput: string;
  preparedVacancyText: string;
  preparedVacancy: NormalizedVacancy | null;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  adaptationSettings: AdaptationSettings;
  fitResponse?: ResumeVacancyFitResponse;
  adaptationResponse?: ResumeAdaptationResponse;
};

function readState() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdaptSessionState) : null;
  } catch {
    return null;
  }
}

function writeState(value: AdaptSessionState | null) {
  if (typeof window === 'undefined') return;

  if (!value) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function useAdaptSessionState() {
  const [state, setState] = useState<AdaptSessionState | null>(() => readState());

  const saveState = useCallback((value: AdaptSessionState) => {
    setState(value);
    writeState(value);
  }, []);

  const clearGenerated = useCallback(() => {
    setState((current) => {
      if (!current) return null;
      const next = { ...current, fitResponse: undefined, adaptationResponse: undefined };
      writeState(next);
      return next;
    });
  }, []);

  return {
    state,
    saveState,
    clearGenerated,
  };
}

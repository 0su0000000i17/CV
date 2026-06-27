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
  if (!value) window.sessionStorage.removeItem(STORAGE_KEY);
  else window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function updateStored(
  setState: (updater: (current: AdaptSessionState | null) => AdaptSessionState | null) => void,
  patcher: (current: AdaptSessionState) => AdaptSessionState
) {
  setState((current) => {
    if (!current) return null;
    const next = patcher(current);
    writeState(next);
    return next;
  });
}

export function useAdaptSessionState() {
  const [state, setState] = useState<AdaptSessionState | null>(() => readState());

  const saveState = useCallback((value: AdaptSessionState) => {
    setState(value);
    writeState(value);
  }, []);

  const clearGenerated = useCallback(() => {
    updateStored(setState, (current) => ({
      ...current,
      fitResponse: undefined,
      adaptationResponse: undefined,
    }));
  }, []);

  const clearAdaptation = useCallback(() => {
    updateStored(setState, (current) => ({ ...current, adaptationResponse: undefined }));
  }, []);

  return {
    state,
    saveState,
    clearGenerated,
    clearAdaptation,
  };
}

'use client';

import { useCallback, useState } from 'react';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';

const STORAGE_KEY = 'cvmatch-adapt-session-v1';

export type AdaptSessionState = {
  selectedResumeId?: string;
  vacancyInput: string;
  preparedVacancyText: string;
  preparedVacancy: NormalizedVacancy | null;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
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

function isSameState(
  current: AdaptSessionState | null,
  next: AdaptSessionState
) {
  if (!current) return false;
  return current.selectedResumeId === next.selectedResumeId &&
    current.vacancyInput === next.vacancyInput &&
    current.preparedVacancyText === next.preparedVacancyText &&
    current.preparedVacancy === next.preparedVacancy &&
    current.extractionStatus === next.extractionStatus &&
    current.extractionMessage === next.extractionMessage &&
    current.fitResponse === next.fitResponse &&
    current.adaptationResponse === next.adaptationResponse;
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
    setState((current) => isSameState(current, value) ? current : value);
    writeState(value);
  }, []);

  const clearGenerated = useCallback(() => {
    updateStored(setState, (current) => {
      if (!current.fitResponse && !current.adaptationResponse) return current;
      return {
        ...current,
        fitResponse: undefined,
        adaptationResponse: undefined,
      };
    });
  }, []);

  const clearAdaptation = useCallback(() => {
    updateStored(setState, (current) => current.adaptationResponse
      ? { ...current, adaptationResponse: undefined }
      : current);
  }, []);

  return {
    state,
    saveState,
    clearGenerated,
    clearAdaptation,
  };
}

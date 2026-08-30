'use client';

import { useState } from 'react';

import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';

type InitialVacancyState = {
  vacancyInput?: string;
  preparedVacancyText?: string;
  preparedVacancy?: NormalizedVacancy | null;
  extractionStatus?: PageExtractionStatus | null;
  extractionMessage?: string;
};

export function useVacancyState(
  onResetResult: () => void,
  initialState?: InitialVacancyState | null
) {
  const [vacancyInput, setVacancyInput] = useState(() => initialState?.vacancyInput || '');
  const [preparedVacancyText, setPreparedVacancyText] = useState(
    () => initialState?.preparedVacancyText || ''
  );
  const [preparedVacancy, setPreparedVacancy] =
    useState<NormalizedVacancy | null>(() => initialState?.preparedVacancy || null);
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(() => initialState?.extractionStatus || null);
  const [extractionMessage, setExtractionMessage] = useState(
    () => initialState?.extractionMessage || ''
  );

  function resetVacancyDraft() {
    setPreparedVacancyText('');
    setPreparedVacancy(null);
    setExtractionStatus(null);
    setExtractionMessage('');
  }

  function handleVacancyInputChange(value: string) {
    setVacancyInput(value);
    resetVacancyDraft();
    onResetResult();
  }

  return {
    extractionMessage,
    extractionStatus,
    preparedVacancy,
    preparedVacancyText,
    vacancyInput,
    handleVacancyInputChange,
    resetVacancyDraft,
    setExtractionMessage,
    setExtractionStatus,
    setPreparedVacancy,
    setPreparedVacancyText,
    setVacancyInput,
  };
}

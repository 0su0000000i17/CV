'use client';

import { useState } from 'react';

import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';

export function useVacancyState(onResetResult: () => void) {
  const [vacancyInput, setVacancyInput] = useState('');
  const [preparedVacancyText, setPreparedVacancyText] = useState('');
  const [preparedVacancy, setPreparedVacancy] =
    useState<NormalizedVacancy | null>(null);
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');

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

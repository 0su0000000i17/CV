'use client';

import { useMemo, useState } from 'react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';
import type { PageExtractionStatus } from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useCoverLetterMutation } from '@/src/shared/hooks/use-cover-letter-mutation';
import { useClipboardCopy } from '@/src/shared/hooks/use-clipboard-copy';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/use-prepare-vacancy-input-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import { useCoverLetterResumeSelection } from './use-cover-letter-resume-selection';

export function useCoverLetterPageState() {
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const coverLetterMutation = useCoverLetterMutation();
  const { copyStatus, copyText, resetCopyStatus } = useClipboardCopy();

  const resumes = useMemo(
    () => resumesQuery.data?.resumes ?? [],
    [resumesQuery.data?.resumes]
  );

  const [vacancyInput, setVacancyInput] = useState('');
  const [selectedTone, setSelectedTone] = useState<CoverLetterTone>(
    'strict_professional'
  );
  const [coverLetterDraft, setCoverLetterDraft] = useState('');
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');

  const selection = useCoverLetterResumeSelection(resumes);

  const isGenerating =
    prepareVacancyMutation.isPending || coverLetterMutation.isPending;

  function resetGeneratedResult() {
    coverLetterMutation.reset();
    setCoverLetterDraft('');
    resetCopyStatus();
  }

  function handleVacancyInputChange(value: string) {
    setVacancyInput(value);
    setExtractionStatus(null);
    setExtractionMessage('');
    resetGeneratedResult();
  }

  function handleSelectTone(tone: CoverLetterTone) {
    setSelectedTone(tone);
    resetGeneratedResult();
  }

  async function handleGenerateCoverLetter() {
    if (!accessToken || !selection.effectiveId || !vacancyInput.trim())
      return;

    setExtractionStatus(null);
    setExtractionMessage('');
    resetGeneratedResult();

    const prepared = await prepareVacancyMutation.mutateAsync({
      input: vacancyInput,
      accessToken,
    });

    setExtractionStatus(prepared.status);
    setExtractionMessage(
      prepared.status === 'success'
        ? 'Вакансия распознана и готова для создания сопроводительного письма.'
        : prepared.message
    );

    if (prepared.status !== 'success' || !prepared.page?.text) return;

    const result = await coverLetterMutation.mutateAsync({
      resumeId: selection.effectiveId,
      vacancyText: prepared.page.text,
      tone: selectedTone,
      accessToken,
    });

    setCoverLetterDraft(result.coverLetter);
  }

  async function handleCopyCoverLetter() {
    await copyText(coverLetterDraft);
  }

  function handleCoverLetterDraftChange(value: string) {
    setCoverLetterDraft(value);
    resetCopyStatus();
  }

  return {
    accessToken,
    resumes,
    selectedResume: selection.selectedResume,
    selectedTone,
    vacancyInput,
    coverLetterDraft,
    copyStatus,
    extractionStatus,
    extractionMessage,
    isGenerating,
    resumesQuery,
    coverLetterMutation,
    handleCopyCoverLetter,
    handleCoverLetterDraftChange,
    handleGenerateCoverLetter,
    handleSelectResume: selection.setSelectedResumeId,
    handleSelectTone,
    handleVacancyInputChange,
  };
}

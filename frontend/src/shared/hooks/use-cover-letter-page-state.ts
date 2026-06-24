'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';
import type { PageExtractionStatus } from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useCoverLetterMutation } from '@/src/shared/hooks/use-cover-letter-mutation';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/use-prepare-vacancy-input-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

export function useCoverLetterPageState() {
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const coverLetterMutation = useCoverLetterMutation();

  const resumes = resumesQuery.data?.resumes ?? [];
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [vacancyInput, setVacancyInput] = useState('');
  const [selectedTone, setSelectedTone] =
    useState<CoverLetterTone>('friendly_neutral');
  const [coverLetterDraft, setCoverLetterDraft] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => resume.id === selectedResumeId);
  }, [resumes, selectedResumeId]);

  const isGenerating =
    prepareVacancyMutation.isPending || coverLetterMutation.isPending;

  useEffect(() => {
    if (selectedResumeId || !resumes[0]?.id) return;
    setSelectedResumeId(resumes[0].id);
  }, [resumes, selectedResumeId]);

  useEffect(() => {
    if (!coverLetterMutation.data?.coverLetter) return;
    setCoverLetterDraft(coverLetterMutation.data.coverLetter);
  }, [coverLetterMutation.data]);

  function resetGeneratedResult() {
    coverLetterMutation.reset();
    setCoverLetterDraft('');
    setCopyStatus('idle');
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
    if (!accessToken || !selectedResumeId || !vacancyInput.trim()) return;

    setExtractionStatus(null);
    setExtractionMessage('');
    resetGeneratedResult();

    const prepared = await prepareVacancyMutation.mutateAsync({
      input: vacancyInput,
      accessToken,
    });

    setExtractionStatus(prepared.status);
    setExtractionMessage(prepared.message);

    if (prepared.status !== 'success' || !prepared.page?.text) return;

    const result = await coverLetterMutation.mutateAsync({
      resumeId: selectedResumeId,
      vacancyText: prepared.page.text,
      tone: selectedTone,
      accessToken,
    });

    setCoverLetterDraft(result.coverLetter);
  }

  async function handleCopyCoverLetter() {
    try {
      await navigator.clipboard.writeText(coverLetterDraft);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    } finally {
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    }
  }

  return {
    accessToken,
    resumes,
    selectedResume,
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
    handleGenerateCoverLetter,
    handleSelectResume: setSelectedResumeId,
    handleSelectTone,
    handleVacancyInputChange,
    setCoverLetterDraft,
  };
}
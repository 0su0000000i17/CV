'use client';

import { useState } from 'react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { useCoverLetterMutation } from '@/src/shared/hooks/use-cover-letter-mutation';
import { CoverLetterGeneratorCard } from '@/src/features/cover-letter/ui/cover-letter-generator-card';
import { CoverLetterResultCard } from '@/src/features/cover-letter/ui/cover-letter-result-card';


type Props = {
  draft: ResumeAdaptationResult;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
};

export function CoverLetterPanel({
  draft,
  sourceResume,
  accessToken,
  vacancyText,
}: Props) {
  const coverLetterMutation = useCoverLetterMutation();
  const [selectedTone, setSelectedTone] =
    useState<CoverLetterTone>('strict_professional');
  const [coverLetterDraft, setCoverLetterDraft] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  const canGenerate = Boolean(
    accessToken && sourceResume?.id && vacancyText.trim()
  );

  function resetResult() {
    coverLetterMutation.reset();
    setCoverLetterDraft('');
    setCopyStatus('idle');
  }

  function handleSelectTone(tone: CoverLetterTone) {
    setSelectedTone(tone);
    resetResult();
  }

  async function handleGenerateCoverLetter() {
    if (!accessToken || !sourceResume?.id || !vacancyText.trim()) return;

    resetResult();

    const result = await coverLetterMutation.mutateAsync({
      resumeId: sourceResume.id,
      vacancyText,
      tone: selectedTone,
      accessToken,
      adaptation: draft,
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

  return (
    <div className="space-y-4">
      <CoverLetterGeneratorCard
        selectedTone={selectedTone}
        isGenerating={coverLetterMutation.isPending}
        canGenerate={canGenerate}
        onSelectTone={handleSelectTone}
        onGenerate={handleGenerateCoverLetter}
        title="Сопроводительное письмо"
        description="Под эту же вакансию и на основе адаптированного резюме."
        compact
      />

      {coverLetterMutation.isError ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {coverLetterMutation.error instanceof Error
            ? coverLetterMutation.error.message
            : 'Не удалось сгенерировать письмо'}
        </p>
      ) : null}

      <CoverLetterResultCard
        value={coverLetterDraft}
        warnings={coverLetterMutation.data?.warnings ?? []}
        copyStatus={copyStatus}
        onChange={setCoverLetterDraft}
        onCopy={handleCopyCoverLetter}
        compact
      />
    </div>
  );
}

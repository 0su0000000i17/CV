'use client';

import { useState } from 'react';
import { Loader2, Mail, Wand2 } from 'lucide-react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { useCoverLetterMutation } from '@/src/shared/hooks/use-cover-letter-mutation';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

import { CoverLetterResult } from './result';
import { CoverLetterToneSelector } from './tone-selector';

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
    <EditorSection
      title="Сопроводительное письмо"
      description="Сгенерируйте письмо под эту же вакансию на основе адаптированного резюме."
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-muted p-2.5">
          <Mail className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h3 className="font-medium text-foreground">Тон письма</h3>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Контакты не отправляются в AI. Backend добавит способы связи после
            генерации.
          </p>
        </div>
      </div>

      <CoverLetterToneSelector
        selectedTone={selectedTone}
        onSelectTone={handleSelectTone}
      />

      <button
        type="button"
        onClick={handleGenerateCoverLetter}
        disabled={!canGenerate || coverLetterMutation.isPending}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {coverLetterMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {coverLetterMutation.isPending
          ? 'Генерируем письмо...'
          : 'Сгенерировать сопроводительное'}
      </button>

      {coverLetterMutation.isError ? (
        <p className="mt-3 text-sm text-red-500">
          {coverLetterMutation.error instanceof Error
            ? coverLetterMutation.error.message
            : 'Не удалось сгенерировать письмо'}
        </p>
      ) : null}

      <CoverLetterResult
        value={coverLetterDraft}
        warnings={coverLetterMutation.data?.warnings ?? []}
        copyStatus={copyStatus}
        onChange={setCoverLetterDraft}
        onCopy={handleCopyCoverLetter}
      />
    </EditorSection>
  );
}

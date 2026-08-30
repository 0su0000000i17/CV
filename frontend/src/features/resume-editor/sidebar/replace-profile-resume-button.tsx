'use client';

import { Check, Save } from 'lucide-react';
import { useMemo, useState } from 'react';

import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';
import { useUpdateResumeTextMutation } from '@/src/shared/hooks/use-update-resume-text-mutation';

import type { ResumeSaveButtonProps } from './save-button-types';

export function ReplaceProfileResumeButton({
  draft,
  contacts,
  photoUrl,
  sourceResume,
  accessToken,
  onSaved,
}: ResumeSaveButtonProps) {
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const mutation = useUpdateResumeTextMutation();
  const currentSnapshot = useMemo(
    () => JSON.stringify({ draft, contacts, photoUrl }),
    [contacts, draft, photoUrl]
  );
  const isUpToDate = status === 'saved' && savedSnapshot === currentSnapshot;
  const disabled = !accessToken || !sourceResume || mutation.isPending || isUpToDate;

  async function handleReplace() {
    if (!accessToken || !sourceResume || disabled) return;
    try {
      setStatus('idle');
      await mutation.mutateAsync({
        resumeId: sourceResume.id,
        accessToken,
        resumeJson: normalizeResumeEditorDraft(draft),
        contacts: contacts as ContactDraft,
        photoUrl,
      });
      setSavedSnapshot(currentSnapshot);
      setStatus('saved');
      onSaved?.();
    } catch {
      setStatus('error');
    }
  }

  const label = mutation.isPending
    ? 'Сохраняем улучшение...'
    : isUpToDate
      ? 'Улучшение сохранено'
      : status === 'error'
        ? 'Повторить сохранение'
        : 'Сохранить улучшение в профиль';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleReplace}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isUpToDate
          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
          : 'border-foreground bg-foreground text-background hover:bg-foreground/80'
      }`}
    >
      {isUpToDate ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {label}
    </button>
  );
}

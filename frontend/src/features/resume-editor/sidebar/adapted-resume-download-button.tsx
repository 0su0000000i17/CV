'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

import { exportAdaptedResumePdf } from '@/src/shared/api/adapted-resume-export';
import { downloadBlob } from '@/src/shared/lib/download-blob';
import { createResumePdfFileName } from '@/src/shared/lib/resume-file-name';

import type { ResumeSaveButtonProps } from './save-button-types';

export function SaveAdaptedResumeButton({
  draft,
  contacts,
  photoUrl,
  sourceResume,
  accessToken,
  vacancyText,
}: ResumeSaveButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const disabled = !accessToken || !sourceResume || status === 'loading';

  async function handleSave() {
    if (!accessToken || !sourceResume || disabled) return;
    try {
      setStatus('loading');
      const blob = await exportAdaptedResumePdf({
        resumeId: sourceResume.id,
        accessToken,
        payload: {
          sourceTitle: sourceResume.file_name || sourceResume.title,
          vacancyText,
          photoUrl,
          contacts,
          adaptation: draft,
        },
      });
      const fileName = createResumePdfFileName(
        contacts.fullName,
        sourceResume.title,
        sourceResume.file_name
      );
      downloadBlob(blob, fileName);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleSave}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-300 transition-colors hover:bg-brand-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {status === 'loading' ? 'Готовим PDF...' : status === 'error' ? 'Не удалось скачать' : 'Скачать PDF'}
    </button>
  );
}

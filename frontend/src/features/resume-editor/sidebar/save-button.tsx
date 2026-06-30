'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import {
  exportAdaptedResumePdf,
  type AdaptedResumeExportContacts,
} from '@/src/shared/api/adapted-resume-export';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

 type Props = {
  draft: ResumeAdaptationResult;
  contacts: AdaptedResumeExportContacts;
  photoUrl: string | null;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
};

function sanitizeFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createFileName(contacts: AdaptedResumeExportContacts, sourceResume?: UploadedResume) {
  const candidateName = sanitizeFileName(contacts.fullName || '');
  if (candidateName) return `${candidateName}.pdf`;

  const sourceName = sanitizeFileName(sourceResume?.title || sourceResume?.file_name || 'resume');
  const baseName = sourceName.replace(/\.pdf$/i, '').trim() || 'resume';

  return `${baseName}.pdf`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export function SaveAdaptedResumeButton({
  draft,
  contacts,
  photoUrl,
  sourceResume,
  accessToken,
  vacancyText,
}: Props) {
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

      downloadBlob(blob, createFileName(contacts, sourceResume));
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
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {status === 'loading'
        ? 'Сохраняем...'
        : status === 'error'
          ? 'Не удалось сохранить'
          : 'Сохранить резюме'}
    </button>
  );
}

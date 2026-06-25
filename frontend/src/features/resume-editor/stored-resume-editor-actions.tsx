'use client';

import { useState } from 'react';
import { Download, Loader2, Save } from 'lucide-react';

import {
  exportAdaptedResumePdf,
  type AdaptedResumeExportContacts,
} from '@/src/shared/api/adapted-resume-export';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { normalizeResumeEditorDraft } from './utils';
import { useEditorState } from './use-editor-state';

type Props = {
  resume: UploadedResume;
  accessToken: string;
  editor: ReturnType<typeof useEditorState>;
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'saved' | 'error';
  onSave: () => Promise<void>;
};

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

function createFileName(resume: UploadedResume) {
  const sourceName = resume.file_name || resume.title || 'resume';
  const baseName = sourceName.replace(/\.[^.]+$/i, '').trim() || 'resume';

  return `${baseName}.cvpro.pdf`;
}

export function StoredResumeEditorActions({
  resume,
  accessToken,
  editor,
  isLoading,
  isSaving,
  saveStatus,
  onSave,
}: Props) {
  const [downloadStatus, setDownloadStatus] =
    useState<'idle' | 'loading' | 'error'>('idle');

  async function handleDownload() {
    if (!editor.draft) return;

    try {
      setDownloadStatus('loading');

      const blob = await exportAdaptedResumePdf({
        resumeId: resume.id,
        accessToken,
        payload: {
          sourceTitle: resume.file_name || resume.title,
          vacancyText: '',
          photoUrl: editor.photoUrl,
          contacts: editor.contacts as AdaptedResumeExportContacts,
          adaptation: normalizeResumeEditorDraft(editor.draft),
        },
      });

      downloadBlob(blob, createFileName(resume));
      setDownloadStatus('idle');
    } catch {
      setDownloadStatus('error');
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Редактор резюме
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Изменения сохраняются только после нажатия кнопки «Сохранить».
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSave}
            disabled={!editor.draft || isSaving || isLoading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Сохраняем...' : 'Сохранить'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!editor.draft || downloadStatus === 'loading'}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloadStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Скачать
          </button>
        </div>
      </div>

      {saveStatus === 'saved' ? (
        <p className="mt-3 text-sm text-emerald-400">Резюме сохранено.</p>
      ) : null}

      {saveStatus === 'error' || downloadStatus === 'error' ? (
        <p className="mt-3 text-sm text-red-500">
          Не удалось выполнить действие. Проверь backend-логи.
        </p>
      ) : null}
    </div>
  );
}
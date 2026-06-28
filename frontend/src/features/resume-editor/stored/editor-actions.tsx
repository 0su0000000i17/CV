'use client';

import { useState } from 'react';
import { Download, Loader2, Save } from 'lucide-react';

import {
  exportAdaptedResumePdf,
  type AdaptedResumeExportContacts,
} from '@/src/shared/api/adapted-resume-export';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';

type Props = {
  resume: UploadedResume;
  accessToken: string;
  editor: ReturnType<typeof useEditorState>;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
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
  hasUnsavedChanges,
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

  const saveButtonDisabled =
    !editor.draft || isSaving || isLoading || !hasUnsavedChanges;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-medium text-foreground">
            Редактор резюме
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Изменения сохраняются только после нажатия кнопки «Сохранить».
          </p>

          {hasUnsavedChanges ? (
            <p className="mt-2 text-sm text-orange-300">
              Есть несохранённые изменения.
            </p>
          ) : saveStatus === 'saved' ? (
            <p className="mt-2 text-sm text-emerald-400">Резюме сохранено.</p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:shrink-0 md:justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saveButtonDisabled}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[136px]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Save className="h-4 w-4 shrink-0" />
            )}
            <span>{isSaving ? 'Сохраняем...' : 'Сохранить'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!editor.draft || downloadStatus === 'loading'}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[120px]"
          >
            {downloadStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Download className="h-4 w-4 shrink-0" />
            )}
            <span>Скачать</span>
          </button>
        </div>
      </div>

      {saveStatus === 'error' || downloadStatus === 'error' ? (
        <p className="mt-3 text-sm text-red-500">
          Не удалось выполнить действие. Проверь backend-логи.
        </p>
      ) : null}
    </div>
  );
}

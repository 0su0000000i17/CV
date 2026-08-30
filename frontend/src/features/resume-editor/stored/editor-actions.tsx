'use client';

import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { EditorActionButtons } from './editor-action-buttons';
import { useEditorDownload } from './use-editor-download';

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

export function StoredResumeEditorActions(props: Props) {
  const download = useEditorDownload(props.resume, props.accessToken, props.editor);
  const saveDisabled = !props.editor.draft
    || props.isSaving
    || props.isLoading
    || !props.hasUnsavedChanges;
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-medium text-foreground">Редактор резюме</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Изменения сохраняются только после нажатия кнопки «Сохранить».
          </p>
          {props.hasUnsavedChanges ? (
            <p className="mt-2 text-sm text-orange-300">Есть несохранённые изменения.</p>
          ) : props.saveStatus === 'saved' ? (
            <p className="mt-2 text-sm text-emerald-400">Резюме сохранено.</p>
          ) : null}
        </div>
        <EditorActionButtons
          canDownload={Boolean(props.editor.draft)}
          downloadStatus={download.status}
          saveDisabled={saveDisabled}
          isSaving={props.isSaving}
          onDownload={download.download}
          onSave={props.onSave}
        />
      </div>
      {props.saveStatus === 'error' || download.status === 'error' ? (
        <p className="mt-3 text-sm text-red-500">
          Не удалось выполнить действие. Проверь backend-логи.
        </p>
      ) : null}
    </div>
  );
}

'use client';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { ResumeEditorContent } from '@/src/features/resume-editor/editor/resume-editor-content';

import { StoredResumeEditorActions } from './editor-actions';
import { EditorLoadingState } from './editor-loading-state';
import { useStoredResumeEditorCard } from './use-stored-resume-editor-card';

type Props = {
  resume: UploadedResume;
  accessToken: string;
};

export function StoredResumeEditorCard({ resume, accessToken }: Props) {
  const editorState = useStoredResumeEditorCard({ resume, accessToken });

  return (
    <section className="space-y-5">
      <StoredResumeEditorActions
        resume={resume}
        accessToken={accessToken}
        editor={editorState.editor}
        isLoading={editorState.isLoading}
        isSaving={editorState.isSaving}
        hasUnsavedChanges={editorState.hasUnsavedChanges}
        saveStatus={editorState.saveStatus}
        onSave={editorState.handleSave}
      />

      {editorState.isLoading ? (
        <EditorLoadingState />
      ) : editorState.loadError ? (
        <EditorErrorState message="Не удалось загрузить текст резюме." />
      ) : editorState.editor.draft ? (
        <ResumeEditorContent editor={editorState.editor} isProfileLoading={false} />
      ) : (
        <EditorErrorState message="Не удалось подготовить структуру резюме для редактора." />
      )}
    </section>
  );
}

function EditorErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">
      {message}
    </div>
  );
}

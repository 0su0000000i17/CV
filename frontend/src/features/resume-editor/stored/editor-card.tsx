'use client';

import { useMemo, useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useResumeTextQuery } from '@/src/shared/hooks/use-resume-text-query';
import { useUpdateResumeTextMutation } from '@/src/shared/hooks/use-update-resume-text-mutation';
import { ResumeEditorContent } from '@/src/features/resume-editor/editor/resume-editor-content';
import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import { createPlainResumeText } from '@/src/features/resume-editor/model/serializer';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';

import { StoredResumeEditorActions } from './editor-actions';
import { EditorLoadingState } from './editor-loading-state';

type Props = {
  resume: UploadedResume;
  accessToken: string;
};

export function StoredResumeEditorCard({ resume, accessToken }: Props) {
  const resumeTextQuery = useResumeTextQuery(resume.id, accessToken);
  const updateResumeTextMutation = useUpdateResumeTextMutation();

  const [saveStatus, setSaveStatus] =
    useState<'idle' | 'saved' | 'error'>('idle');

  const initialText = resumeTextQuery.data?.markdown ?? '';
  const initialDraft = useMemo(() => {
    const resumeJson = resumeTextQuery.data?.resumeJson;

    return resumeJson ? normalizeResumeEditorDraft(resumeJson) : null;
  }, [resumeTextQuery.data?.resumeJson]);

  const editor = useEditorState({
    initialDraft,
    initialContacts: resumeTextQuery.data?.contacts,
    resetKey: `${resume.id}-${resumeTextQuery.data?.source ?? 'loading'}`,
    sourceResume: {
      ...resume,
      extracted_text: initialText,
    },
  });

  const isLoading = resumeTextQuery.isPending;
  const isSaving = updateResumeTextMutation.isPending;

  async function handleSave() {
    if (!editor.draft) return;

    const normalizedDraft = normalizeResumeEditorDraft(editor.draft);
    const markdown = createPlainResumeText(normalizedDraft, editor.contacts);

    if (!markdown.trim()) return;

    try {
      await updateResumeTextMutation.mutateAsync({
        resumeId: resume.id,
        markdown,
        resumeJson: normalizedDraft,
        accessToken,
      });

      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  return (
    <section className="space-y-5">
      <StoredResumeEditorActions
        resume={resume}
        accessToken={accessToken}
        editor={editor}
        isLoading={isLoading}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onSave={handleSave}
      />

      {isLoading ? (
        <EditorLoadingState />
      ) : resumeTextQuery.isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">
          Не удалось загрузить текст резюме.
        </div>
      ) : editor.draft ? (
        <ResumeEditorContent editor={editor} isProfileLoading={false} />
      ) : (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">
          Не удалось подготовить структуру резюме для редактора.
        </div>
      )}
    </section>
  );
}
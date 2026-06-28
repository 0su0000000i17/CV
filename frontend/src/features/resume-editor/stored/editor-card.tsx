'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useResumeTextQuery } from '@/src/shared/hooks/use-resume-text-query';
import { useUpdateResumeTextMutation } from '@/src/shared/hooks/use-update-resume-text-mutation';
import { ResumeEditorContent } from '@/src/features/resume-editor/editor/resume-editor-content';
import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';

import { StoredResumeEditorActions } from './editor-actions';
import { EditorLoadingState } from './editor-loading-state';

type Props = {
  resume: UploadedResume;
  accessToken: string;
};

function createEditorSnapshot(
  draft: ReturnType<typeof normalizeResumeEditorDraft>,
  contacts: ContactDraft,
  photoUrl: string | null
) {
  return JSON.stringify({
    draft,
    contacts,
    photoUrl,
  });
}

export function StoredResumeEditorCard({ resume, accessToken }: Props) {
  const resumeTextQuery = useResumeTextQuery(resume.id, accessToken);
  const updateResumeTextMutation = useUpdateResumeTextMutation();
  const initializedResumeIdRef = useRef<string | null>(null);

  const [saveStatus, setSaveStatus] =
    useState<'idle' | 'saved' | 'error'>('idle');
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(
    null
  );

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
      source_resume_document:
        resumeTextQuery.data?.document ?? resume.source_resume_document,
    },
  });

  const loadedSnapshot = useMemo(() => {
    if (!initialDraft || !resumeTextQuery.data?.contacts) return null;

    return createEditorSnapshot(
      initialDraft,
      resumeTextQuery.data.contacts,
      editor.photoUrl
    );
  }, [editor.photoUrl, initialDraft, resumeTextQuery.data?.contacts]);

  const currentSnapshot = useMemo(() => {
    if (!editor.draft) return null;

    return createEditorSnapshot(
      normalizeResumeEditorDraft(editor.draft),
      editor.contacts,
      editor.photoUrl
    );
  }, [editor.contacts, editor.draft, editor.photoUrl]);

  const hasUnsavedChanges = Boolean(
    currentSnapshot &&
      lastSavedSnapshot &&
      currentSnapshot !== lastSavedSnapshot
  );

  const isLoading = resumeTextQuery.isPending;
  const isSaving = updateResumeTextMutation.isPending;

  useEffect(() => {
    if (!loadedSnapshot) return;
    if (initializedResumeIdRef.current === resume.id) return;

    initializedResumeIdRef.current = resume.id;
    setLastSavedSnapshot(loadedSnapshot);
    setSaveStatus('idle');
  }, [loadedSnapshot, resume.id]);

  useEffect(() => {
    if (hasUnsavedChanges && saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  }, [hasUnsavedChanges, saveStatus]);

  async function handleSave() {
    if (!editor.draft) return;

    const normalizedDraft = normalizeResumeEditorDraft(editor.draft);
    const nextSnapshot = createEditorSnapshot(
      normalizedDraft,
      editor.contacts,
      editor.photoUrl
    );

    try {
      await updateResumeTextMutation.mutateAsync({
        resumeId: resume.id,
        resumeJson: normalizedDraft,
        contacts: editor.contacts,
        photoUrl: editor.photoUrl,
        accessToken,
      });

      setLastSavedSnapshot(nextSnapshot);
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
        hasUnsavedChanges={hasUnsavedChanges}
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

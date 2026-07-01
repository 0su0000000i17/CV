import { useEffect, useMemo, useRef, useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useResumeTextQuery } from '@/src/shared/hooks/use-resume-text-query';
import { useUpdateResumeTextMutation } from '@/src/shared/hooks/use-update-resume-text-mutation';
import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';

import { createEditorSnapshot, getStoredPhotoUrl } from './editor-state';

export function useStoredResumeEditorCard(params: {
  resume: UploadedResume;
  accessToken: string;
}) {
  const { resume, accessToken } = params;
  const resumeTextQuery = useResumeTextQuery(resume.id, accessToken);
  const updateResumeTextMutation = useUpdateResumeTextMutation();
  const initializedResumeIdRef = useRef<string | null>(null);
  const [saveStatus, setSaveStatus] =
    useState<'idle' | 'saved' | 'error'>('idle');
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const initialText = resumeTextQuery.data?.markdown ?? '';
  const sourceDocument =
    resumeTextQuery.data?.document ?? resume.source_resume_document;
  const initialPhotoUrl = getStoredPhotoUrl(sourceDocument);

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
      source_resume_document: sourceDocument,
    },
  });

  const loadedSnapshot = useMemo(() => {
    if (!initialDraft || !resumeTextQuery.data?.contacts) return null;
    return createEditorSnapshot(
      initialDraft,
      resumeTextQuery.data.contacts,
      initialPhotoUrl
    );
  }, [initialDraft, initialPhotoUrl, resumeTextQuery.data?.contacts]);

  const currentSnapshot = useMemo(() => {
    if (!editor.draft) return null;
    return createEditorSnapshot(
      normalizeResumeEditorDraft(editor.draft),
      editor.contacts,
      editor.photoUrl
    );
  }, [editor.contacts, editor.draft, editor.photoUrl]);

  const hasUnsavedChanges = Boolean(
    currentSnapshot && lastSavedSnapshot && currentSnapshot !== lastSavedSnapshot
  );

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

  return {
    editor,
    handleSave,
    hasUnsavedChanges,
    isLoading: resumeTextQuery.isPending,
    isSaving: updateResumeTextMutation.isPending,
    loadError: resumeTextQuery.isError,
    saveStatus,
  };
}

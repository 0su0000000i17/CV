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
  const initialContacts = resumeTextQuery.data?.contacts;

  const initialDraft = useMemo(() => {
    const resumeJson = resumeTextQuery.data?.resumeJson;
    return resumeJson
      ? normalizeResumeEditorDraft(resumeJson, { sourceDocument })
      : null;
  }, [resumeTextQuery.data?.resumeJson, sourceDocument]);

  const editor = useEditorState({
    initialDraft,
    initialContacts,
    initialPhotoUrl,
    resetKey: `${resume.id}-${resumeTextQuery.data?.source ?? 'loading'}`,
    sourceResume: {
      ...resume,
      extracted_text: initialText,
      source_resume_document: sourceDocument,
    },
  });

  // initialDraft (above) and editor.draft (seeded inside useEditorState) are
  // both already run through normalizeResumeEditorDraft with the same
  // sourceDocument context exactly once. Re-normalizing either one here for
  // comparison used to apply the normalizer a second time with different
  // (or missing) context each time, which reshapes skills differently and
  // made a freshly loaded, untouched resume compare as "changed". Snapshot
  // the already-normalized values directly instead.
  const loadedSnapshot = useMemo(() => {
    if (!initialDraft || !initialContacts) return null;
    return createEditorSnapshot(initialDraft, initialContacts, initialPhotoUrl);
  }, [initialContacts, initialDraft, initialPhotoUrl]);

  const currentSnapshot = useMemo(() => {
    if (!editor.draft) return null;
    return createEditorSnapshot(editor.draft, editor.contacts, editor.photoUrl);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a new local edit clears the transient saved indicator
      setSaveStatus('idle');
    }
  }, [hasUnsavedChanges, saveStatus]);

  async function handleSave() {
    if (!editor.draft) return;

    const normalizedDraft = normalizeResumeEditorDraft(editor.draft, {
      sourceDocument,
    });
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

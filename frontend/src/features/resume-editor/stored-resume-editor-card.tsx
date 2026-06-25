'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useResumeProfileExtractionQuery } from '@/src/shared/hooks/use-resume-profile-extraction-query';
import { useResumeTextQuery } from '@/src/shared/hooks/use-resume-text-query';
import { useUpdateResumeTextMutation } from '@/src/shared/hooks/use-update-resume-text-mutation';

import { ResumeEditorContent } from './resume-editor-content';
import { StoredResumeEditorActions } from './stored-resume-editor-actions';
import {
  createAdaptationFromPlainText,
  createPlainResumeText,
  normalizeResumeEditorDraft,
} from './utils';
import { useEditorState } from './use-editor-state';

type Props = {
  resume: UploadedResume;
  accessToken: string;
};

function createInitialTitle(resume: UploadedResume) {
  return resume.role || resume.title || resume.file_name || 'Резюме';
}

export function StoredResumeEditorCard({ resume, accessToken }: Props) {
  const resumeTextQuery = useResumeTextQuery(resume.id, accessToken);
  const profileExtractionQuery = useResumeProfileExtractionQuery(
    resume.id,
    accessToken
  );
  const updateResumeTextMutation = useUpdateResumeTextMutation();

  const [saveStatus, setSaveStatus] =
    useState<'idle' | 'saved' | 'error'>('idle');

  const initialText = resumeTextQuery.data?.markdown ?? '';
  const initialDraft = useMemo(() => {
    const savedJson = resumeTextQuery.data?.resumeJson;

    if (savedJson) {
      return normalizeResumeEditorDraft(savedJson);
    }

    if (!initialText) {
      return null;
    }

    return createAdaptationFromPlainText(initialText, createInitialTitle(resume));
  }, [
    initialText,
    resume.file_name,
    resume.role,
    resume.title,
    resumeTextQuery.data?.resumeJson,
  ]);

  const editor = useEditorState({
    initialDraft,
    profileExtraction: profileExtractionQuery.data,
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
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card/60">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : resumeTextQuery.isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">
          Не удалось загрузить текст резюме.
        </div>
      ) : (
        <ResumeEditorContent
          editor={editor}
          isProfileLoading={profileExtractionQuery.isPending}
        />
      )}
    </section>
  );
}
'use client';

import { CoverLetterPanel } from '@/src/features/resume-editor/cover-letter/panel';
import { ResumeEditorContent } from '@/src/features/resume-editor/editor/resume-editor-content';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';
import type { AdaptationResultCardProps } from '@/src/features/resume-editor/model/types';
import { EditorSidebar } from '@/src/features/resume-editor/sidebar/editor-sidebar';
import { ErrorState, LoadingState } from '@/src/features/resume-editor/ui/result-states';

export function AdaptationResultCard({
  adaptationResponse,
  profileExtraction,
  sourceResume,
  accessToken,
  vacancyText,
  isAdapting,
  isError,
  isProfileLoading,
  errorMessage,
  onResetAdaptation,
}: AdaptationResultCardProps) {
  const editor = useEditorState({
    adaptationResponse,
    profileExtraction,
    sourceResume,
  });

  if (isAdapting) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState errorMessage={errorMessage} />;
  }

  if (!adaptationResponse || !editor.draft) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <ResumeEditorContent
          editor={editor}
          isProfileLoading={isProfileLoading}
        />

        <CoverLetterPanel
          draft={editor.draft}
          sourceResume={sourceResume}
          accessToken={accessToken}
          vacancyText={vacancyText}
        />
      </div>

      <EditorSidebar
        draft={editor.draft}
        contacts={editor.contacts}
        photoUrl={editor.photoUrl}
        sourceResume={sourceResume}
        accessToken={accessToken}
        vacancyText={vacancyText}
        copyStatus={editor.copyStatus}
        onCopyResumeText={editor.copyResumeText}
        onResetAdaptation={onResetAdaptation}
      />
    </div>
  );
}

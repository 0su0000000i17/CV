'use client';

import { CoverLetterPanel } from './cover-letter-panel';
import { EditorSidebar } from './editor-sidebar';
import { ErrorState, LoadingState } from './result-states';
import { ResumeEditorContent } from './resume-editor-content';
import type { AdaptationResultCardProps } from './types';
import { useEditorState } from './use-editor-state';

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
'use client';

import { ResumeEditorContent } from '@/src/features/resume-editor/editor/resume-editor-content';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';
import type { AdaptationResultCardProps } from '@/src/features/resume-editor/model/types';
import { EditorSidebar } from '@/src/features/resume-editor/sidebar/editor-sidebar';
import { ErrorState } from '@/src/features/resume-editor/ui/result-states';
import { StagedLoadingState } from '@/src/shared/ui/staged-loading-state';

import { adaptLoadingSteps, adaptLongWaitSteps } from './adapt-loading-steps';
import { ChangeExplanationsPanel } from './change-explanations-panel';
import { FitChangeBanner } from './fit-change-banner';
import { ResultStateLayout } from './result-state-layout';

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
  loadingTitle = 'Создаём адаптацию',
  loadingSteps = adaptLoadingSteps,
  loadingLongWaitSteps = adaptLongWaitSteps,
  errorTitle,
  sidebarTitle,
  sidebarDescription,
  resetButtonLabel,
  resetButtonVisible = true,
  coverLetterEnabled = true,
  replaceProfileEnabled = false,
  onProfileReplaced,
  onResetAdaptation,
}: AdaptationResultCardProps) {
  const editor = useEditorState({
    adaptationResponse,
    profileExtraction,
    sourceResume,
  });

  if (isAdapting) {
    return (
      <ResultStateLayout>
        <StagedLoadingState
          heading={loadingTitle}
          steps={loadingSteps}
          longWaitSteps={loadingLongWaitSteps}
        />
      </ResultStateLayout>
    );
  }

  if (isError) {
    return (
      <ResultStateLayout>
        <ErrorState title={errorTitle} errorMessage={errorMessage} />
      </ResultStateLayout>
    );
  }

  if (!adaptationResponse || !editor.draft) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <FitChangeBanner
          fitBefore={adaptationResponse.meta.fitBefore}
          fitAfter={adaptationResponse.meta.fitAfter}
        />
        <ChangeExplanationsPanel
          result={editor.draft}
          sourceResume={sourceResume}
          vacancyText={vacancyText}
        />
        <ResumeEditorContent
          editor={editor}
          isProfileLoading={isProfileLoading}
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
        sidebarTitle={sidebarTitle}
        sidebarDescription={sidebarDescription}
        resetButtonLabel={resetButtonLabel}
        resetButtonVisible={resetButtonVisible}
        coverLetterEnabled={coverLetterEnabled}
        replaceProfileEnabled={replaceProfileEnabled}
        onProfileReplaced={onProfileReplaced}
        onCopyResumeText={editor.copyResumeText}
        onResetAdaptation={onResetAdaptation}
      />
    </div>
  );
}

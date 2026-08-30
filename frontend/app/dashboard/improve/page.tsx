'use client';

import { useMemo } from 'react';

import { DashboardPageLoading } from '../_components/dashboard-page-loading';
import { ImproveHero } from './_components/improve-hero';
import { ImproveStartPanel } from './_components/improve-start-panel';
import { ImproveWorkspace } from './_components/improve-workspace';
import { useImproveSelection } from './_hooks/use-improve-selection';
import { useImprovementProfile } from './_hooks/use-improvement-profile';
import { useImprovementQuestions } from './_hooks/use-improvement-questions';
import { useImproveSessionState } from './_hooks/use-improve-session-state';
import { questionsLoadingSteps, questionsLongWaitSteps } from './_lib/questions-loading-steps';
import styles from './improve.module.css';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import { ClarifyingQuestionsCard } from '@/src/shared/ui/clarifying-questions-card';
import { ResumeSelectorCard } from '@/src/shared/ui/resume-selector-card';
import { StagedLoadingState } from '@/src/shared/ui/staged-loading-state';

export default function ImproveResumePage() {
  const { accessToken } = useAuth();
  const saved = useImproveSessionState();
  const resumesQuery = useResumesQuery(accessToken);
  const resumes = useMemo(() => resumesQuery.data?.resumes ?? [], [resumesQuery.data?.resumes]);
  const selection = useImproveSelection(resumes, saved.state?.selectedResumeId);
  const profile = useImprovementProfile({
    accessToken,
    resumeId: selection.selectedResume?.id,
    savedState: saved.state,
    saveState: saved.saveState,
    clearState: saved.clearState,
  });
  const questions = useImprovementQuestions({
    accessToken,
    resumeId: selection.selectedResume?.id,
    onRun: profile.run,
  });

  function reset() {
    questions.reset();
    profile.reset();
  }

  function selectResume(resumeId: string) {
    reset();
    selection.navigateToResume(resumeId);
  }

  if (!accessToken || resumesQuery.isPending) {
    return <DashboardPageLoading label="Готовим улучшение резюме..." />;
  }
  let content;
  if (profile.hasWorkspace) {
    content = (
      <ImproveWorkspace
        response={profile.adaptation}
        profile={profile.profileExtraction}
        resume={selection.selectedResume}
        accessToken={accessToken}
        isPending={profile.isCurrent && profile.improvement.isPending}
        isError={profile.isCurrent && profile.improvement.isError}
        isProfileLoading={profile.isProfileLoading}
        error={profile.improvement.error}
        saved={profile.isSaved}
        canReset={resumes.length > 1}
        onSaved={profile.markSaved}
        onReset={reset}
      />
    );
  } else if (questions.questions.isPending) {
    content = <StagedLoadingState heading="Готовим уточняющие вопросы" steps={questionsLoadingSteps} longWaitSteps={questionsLongWaitSteps} />;
  } else if (questions.activeSession) {
    content = (
      <ClarifyingQuestionsCard
        session={questions.activeSession}
        isSubmitting={questions.submit.isPending || profile.improvement.isPending}
        onSubmit={questions.submitAnswers}
        onSkip={questions.skip}
      />
    );
  } else {
    content = (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ResumeSelectorCard
          selectedResume={selection.selectedResume}
          resumes={resumes}
          isLoading={false}
          isError={resumesQuery.isError}
          onSelectResume={selectResume}
          description="Выберите версию, которую нужно сделать сильнее. Исходный файл останется доступен."
          modalDescription="Выбранный файл будет использован для улучшения резюме."
        />
        <ImproveStartPanel
          disabled={!selection.selectedResume || questions.questions.isPending}
          onStart={questions.start}
        />
      </div>
    );
  }
  return (
    <div className={`${styles.page} mx-auto max-w-[1120px] space-y-6`}>
      <ImproveHero />
      <div className={styles.state}>{content}</div>
    </div>
  );
}

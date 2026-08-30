'use client';

import { AnalyzeHeader } from './_components/analyze-header';
import { AnalyzeSidebar } from './_components/analyze-sidebar';
import { ChecksGrid } from './_components/checks-grid';
import { FutureResultCard } from './_components/future-result-card';
import { SelectedResumeCard } from './_components/selected-resume-card';
import { useAnalyzePageState } from './_hooks/use-analyze-page-state';
import styles from './analyze.module.css';
import { DashboardPageLoading } from '../_components/dashboard-page-loading';

export default function AnalyzePage() {
  const {
    analysis,
    analyzeResumeMutation,
    handleRunAnalyze,
    handleSelectResume,
    isAnalyzeUiLoading,
    previousScore,
    resumes,
    resumesQuery,
    selectedResume,
    shouldShowResultCard,
  } = useAnalyzePageState();

  if (resumesQuery.isPending) {
    return <DashboardPageLoading label="Готовим оценку резюме..." />;
  }

  return (
    <div className={`${styles.analyzePage} mx-auto max-w-[1120px]`}>
      <AnalyzeHeader
        selectedResume={selectedResume}
        isAnalyzing={isAnalyzeUiLoading}
        onAnalyze={handleRunAnalyze}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SelectedResumeCard
            selectedResume={selectedResume}
            resumes={resumes}
            isLoading={resumesQuery.isPending}
            isError={resumesQuery.isError}
            onSelectResume={handleSelectResume}
          />

          {shouldShowResultCard ? (
            <FutureResultCard
              analysis={analysis}
              isAnalyzing={isAnalyzeUiLoading}
              isError={analyzeResumeMutation.isError}
              errorMessage={
                analyzeResumeMutation.error instanceof Error
                  ? analyzeResumeMutation.error.message
                  : undefined
              }
            />
          ) : (
            <ChecksGrid />
          )}
        </div>

        <AnalyzeSidebar
          selectedResume={selectedResume}
          analysis={analysis}
          previousScore={previousScore}
          isAnalyzing={isAnalyzeUiLoading}
          onAnalyze={handleRunAnalyze}
        />
      </div>
    </div>
  );
}

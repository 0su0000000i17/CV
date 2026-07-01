'use client';

import { AnalyzeHeader } from './_components/analyze-header';
import { AnalyzeSidebar } from './_components/analyze-sidebar';
import { ChecksGrid } from './_components/checks-grid';
import { FutureResultCard } from './_components/future-result-card';
import { SelectedResumeCard } from './_components/selected-resume-card';
import { useAnalyzePageState } from './_hooks/use-analyze-page-state';

export default function AnalyzePage() {
  const {
    analysis,
    analyzeResumeMutation,
    handleRunAnalyze,
    handleSelectResume,
    isAnalyzeUiLoading,
    resumes,
    resumesQuery,
    selectedResume,
    shouldShowResultCard,
  } = useAnalyzePageState();

  return (
    <div>
      <AnalyzeHeader
        selectedResume={selectedResume}
        isAnalyzing={isAnalyzeUiLoading}
        onAnalyze={handleRunAnalyze}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
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
          isAnalyzing={isAnalyzeUiLoading}
          onAnalyze={handleRunAnalyze}
        />
      </div>
    </div>
  );
}

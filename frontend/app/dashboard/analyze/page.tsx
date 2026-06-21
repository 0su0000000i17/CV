'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnalyzeHeader } from './_components/AnalyzeHeader';
import { AnalyzeSidebar } from './_components/AnalyzeSidebar';
import { ChecksGrid } from './_components/ChecksGrid';
import { FutureResultCard } from './_components/FutureResultCard';
import { SelectedResumeCard } from './_components/SelectedResumeCard';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/useAnalyzeResumeMutation';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();

  const resumeId = searchParams.get('resumeId');

  const resumes = resumesQuery.data?.resumes ?? [];

  const selectedResume = useMemo(() => {
    if (!resumes.length) {
      return undefined;
    }

    if (!resumeId) {
      return resumes[0];
    }

    return resumes.find((resume) => resume.id === resumeId);
  }, [resumeId, resumes]);

  const analysisResult = analyzeResumeMutation.data;
  const analysis = analysisResult?.analysis;

  const shouldShowResultCard =
    Boolean(analysis) ||
    analyzeResumeMutation.isPending ||
    analyzeResumeMutation.isError;

  function handleSelectResume(nextResumeId: string) {
    analyzeResumeMutation.reset();
    router.replace(`/dashboard/analyze?resumeId=${nextResumeId}`);
  }

  function handleRunAnalyze() {
    if (!selectedResume || !accessToken || analyzeResumeMutation.isPending) {
      return;
    }

    analyzeResumeMutation.mutate({
      resumeId: selectedResume.id,
      accessToken,
    });
  }

  return (
    <div>
      <AnalyzeHeader
        selectedResume={selectedResume}
        isAnalyzing={analyzeResumeMutation.isPending}
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
              isAnalyzing={analyzeResumeMutation.isPending}
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
          isAnalyzing={analyzeResumeMutation.isPending}
          onAnalyze={handleRunAnalyze}
        />
      </div>
    </div>
  );
}
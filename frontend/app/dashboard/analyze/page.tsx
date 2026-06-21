'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnalyzeHeader } from './_components/AnalyzeHeader';
import { AnalyzeSidebar } from './_components/AnalyzeSidebar';
import { ChecksGrid } from './_components/ChecksGrid';
import { FutureResultCard } from './_components/FutureResultCard';
import { SelectedResumeCard } from './_components/SelectedResumeCard';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);

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

  function handleSelectResume(nextResumeId: string) {
    router.replace(`/dashboard/analyze?resumeId=${nextResumeId}`);
  }

  return (
    <div>
      <AnalyzeHeader selectedResume={selectedResume} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SelectedResumeCard
            selectedResume={selectedResume}
            resumes={resumes}
            isLoading={resumesQuery.isPending}
            isError={resumesQuery.isError}
            onSelectResume={handleSelectResume}
          />

          <ChecksGrid />
          <FutureResultCard />
        </div>

        <AnalyzeSidebar selectedResume={selectedResume} />
      </div>
    </div>
  );
}

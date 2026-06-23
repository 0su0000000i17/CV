'use client';

import { useParams } from 'next/navigation';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumeQuery } from '@/src/shared/hooks/use-resume-query';

import { ResumeActionsPanel } from './_components/resume-actions-panel';
import { ResumeDetailsHeader } from './_components/resume-details-header';
import { ResumeDetailsSkeleton } from './_components/resume-details-skeleton';
import { ResumeFileInfoCard } from './_components/resume-file-info-card';
import { ResumeNotFoundState } from './_components/resume-not-found-state';
import { ResumeStatsCards } from './_components/resume-stats-cards';
import { ResumeVersionsCard } from './_components/resume-versions-card';

function getResumeId(value: string | string[] | undefined) {
  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}

export default function ResumeDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const { accessToken, loading: authLoading } = useAuth();

  const resumeId = getResumeId(params.id);
  const resumeQuery = useResumeQuery(resumeId, accessToken);
  const resume = resumeQuery.data?.resume;

  if (authLoading || (resumeId && accessToken && resumeQuery.isPending)) {
    return <ResumeDetailsSkeleton />;
  }

  if (!resumeId || resumeQuery.isError || !resume) {
    return <ResumeNotFoundState />;
  }

  return (
    <div>
      <ResumeDetailsHeader resume={resume} />
      <ResumeStatsCards resume={resume} />

      <div className="mb-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ResumeActionsPanel resume={resume} />
        <ResumeFileInfoCard resume={resume} />
      </div>

      <ResumeVersionsCard resume={resume} />
    </div>
  );
}
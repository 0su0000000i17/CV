'use client';

import { useParams } from 'next/navigation';

import { StoredResumeEditorCard } from '@/src/features/resume-editor/stored/editor-card';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumeQuery } from '@/src/shared/hooks/use-resume-query';

import { ResumeActionsPanel } from './_components/resume-actions-panel';
import { ResumeAdaptationsCard } from './_components/resume-adaptations-card';
import { ResumeDetailsHeader } from './_components/resume-details-header';
import { ResumeDetailsSkeleton } from './_components/resume-details-skeleton';
import { ResumeFileInfoCard } from './_components/resume-file-info-card';
import { ResumeNotFoundState } from './_components/resume-not-found-state';

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

  if (!resumeId || resumeQuery.isError || !resume || !accessToken) {
    return <ResumeNotFoundState />;
  }

  return (
    <div className="space-y-6">
      <ResumeDetailsHeader resume={resume} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <StoredResumeEditorCard resume={resume} accessToken={accessToken} />

        <aside className="space-y-5">
          <ResumeActionsPanel resume={resume} />
          <ResumeAdaptationsCard resume={resume} />
          <ResumeFileInfoCard resume={resume} />
        </aside>
      </div>
    </div>
  );
}
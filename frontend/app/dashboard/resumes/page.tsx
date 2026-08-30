'use client';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import { DashboardPageLoading } from '../_components/dashboard-page-loading';

import { ResumesHeader } from './_components/resumes-header';
import { ResumesList } from './_components/resumes-list';
import { ResumesStats } from './_components/resumes-stats';
import styles from './resumes.module.css';

export default function ResumesPage() {
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const resumes = resumesQuery.data?.resumes ?? [];

  if (!accessToken || resumesQuery.isPending) {
    return <DashboardPageLoading label="Загружаем резюме..." />;
  }

  return (
    <div className={`${styles.resumesPage} mx-auto max-w-[1120px]`}>
      <ResumesHeader resumeCount={resumes.length} />
      <ResumesStats resumes={resumes} />
      <ResumesList
        resumes={resumes}
        isLoading={false}
        isError={resumesQuery.isError}
      />
    </div>
  );
}

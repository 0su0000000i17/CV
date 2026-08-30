'use client';

import { BarChart3, FileText, Sparkles } from 'lucide-react';

import { DashboardActions } from './_components/dashboard-actions';
import { DashboardHero } from './_components/dashboard-hero';
import { DashboardPageLoading } from './_components/dashboard-page-loading';
import { DashboardRecentResumes } from './_components/dashboard-recent-resumes';
import { useDashboardResumeSelection } from './_components/dashboard-resume-selection-provider';
import { DashboardStatCard } from './_components/dashboard-stat-card';
import {
  createResumeActionHref,
  getAverageScore,
  getCheckedResumes,
  getFirstName,
  getLatestCheckedResume,
} from './_lib/dashboard-resume-stats';
import styles from './dashboard.module.css';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

export default function DashboardPage() {
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const { accessToken, user } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const resumesQuery = useResumesQuery(accessToken);
  const profile = profileQuery.data?.profile;
  const resumes = resumesQuery.data?.resumes ?? [];
  const checked = getCheckedResumes(resumes);
  const average = getAverageScore(resumes);
  const latest = getLatestCheckedResume(resumes);
  const selectedExists = selectedResumeId
    ? resumes.some((resume) => resume.id === selectedResumeId) : false;
  const actionResumeId = selectedExists && selectedResumeId
    ? selectedResumeId : latest?.id ?? resumes[0]?.id;
  const hrefs = {
    analyze: createResumeActionHref('/dashboard/analyze', actionResumeId),
    improve: createResumeActionHref('/dashboard/improve', actionResumeId),
    adapt: createResumeActionHref('/dashboard/adapt', actionResumeId),
  };
  if (resumesQuery.isLoading || profileQuery.isLoading) {
    return <DashboardPageLoading label="Готовим обзор..." />;
  }
  function handleUploadedResume(resume: UploadedResume) {
    setSelectedResumeId(resume.id);
  }
  return (
    <div className={`${styles.dashboardPage} mx-auto max-w-[1120px]`}>
      <DashboardHero
        firstName={getFirstName(profile?.full_name, profile?.email || user?.email)}
        resumesCount={resumes.length}
        latestResume={latest}
        onUploaded={handleUploadedResume}
      />
      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <DashboardStatCard label="Резюме" value={String(resumes.length)} caption="Файлов в личном кабинете" icon={<FileText className="h-4 w-4" />} />
        <DashboardStatCard label="Проверено" value={`${checked.length}/${resumes.length}`} caption="С готовой оценкой" icon={<BarChart3 className="h-4 w-4" />} />
        <DashboardStatCard label="Средний балл" value={average === null ? '—' : `${average}/100`} caption="По всем оценённым резюме" icon={<Sparkles className="h-4 w-4" />} />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DashboardRecentResumes resumes={resumes.slice(0, 4)} isError={resumesQuery.isError} />
        <DashboardActions {...hrefs} />
      </section>
    </div>
  );
}

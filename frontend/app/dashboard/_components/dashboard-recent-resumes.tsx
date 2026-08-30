import { Plus } from 'lucide-react';
import Link from 'next/link';

import { DashboardResumeRow } from './dashboard-resume-row';
import type { UploadedResume } from '@/src/shared/api/resumes';

export function DashboardRecentResumes({ resumes, isError }: {
  resumes: UploadedResume[];
  isError: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.018]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-medium tracking-[-0.025em] text-foreground">Последние резюме</h2>
          <p className="mt-1 text-sm text-muted-foreground">Продолжите с того места, где остановились</p>
        </div>
        <Link href="/dashboard/resumes" className="shrink-0 text-sm text-white/45 transition-colors hover:text-white">Все</Link>
      </div>
      {isError ? (
        <div className="p-6 text-sm text-red-300">Не удалось загрузить резюме. Попробуйте обновить страницу.</div>
      ) : resumes.length ? (
        <div className="divide-y divide-white/10">
          {resumes.map((resume) => <DashboardResumeRow key={resume.id} resume={resume} />)}
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-dashed border-white/12 p-7 text-center sm:p-9">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/50"><Plus className="h-5 w-5" /></span>
            <p className="mt-4 text-base font-medium text-foreground">Здесь появятся ваши резюме</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Загрузите PDF, чтобы получить оценку и рекомендации.</p>
          </div>
        </div>
      )}
    </div>
  );
}

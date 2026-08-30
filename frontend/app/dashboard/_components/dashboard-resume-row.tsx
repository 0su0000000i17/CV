import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

import type { UploadedResume } from '@/src/shared/api/resumes';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(value));
}

function status(resume: UploadedResume) {
  switch (resume.analysis_status) {
    case 'completed': return { label: 'Оценено', className: 'text-white/70' };
    case 'analyzing': return { label: 'Оценивается', className: 'text-white/55' };
    case 'failed': return { label: 'Ошибка оценки', className: 'text-red-300' };
    case 'needs_update': return { label: 'Нужно обновить', className: 'text-amber-200' };
    default: return { label: 'Не оценено', className: 'text-white/35' };
  }
}

export function DashboardResumeRow({ resume }: { resume: UploadedResume }) {
  const analysis = status(resume);
  const score = resume.analysis_status === 'completed' && resume.last_score !== null
    ? resume.last_score : '—';
  return (
    <div className="group flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:px-6 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/50">
          <FileText className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/dashboard/resumes/${resume.id}`} title={resume.title} className="block truncate text-sm font-medium text-foreground transition-colors hover:text-white/75">
            {resume.title}
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground">{resume.role || 'Роль не указана'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className={analysis.className}>{analysis.label}</span>
            <span className="text-white/25">{formatDate(resume.updated_at)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-[3.35rem] lg:justify-end lg:pl-0">
        <div className="min-w-12 text-right">
          <span className="text-lg font-medium tracking-tight text-white">{score}</span>
          <span className="ml-0.5 text-[0.65rem] text-white/25">/100</span>
        </div>
        <Link href={`/dashboard/resumes/${resume.id}`} aria-label={`Открыть ${resume.title}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/55 transition-[background-color,border-color,color,transform] hover:border-white/20 hover:bg-white/[0.045] hover:text-white active:scale-[0.96]">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

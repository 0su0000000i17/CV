import Link from 'next/link';
import { FileText } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

import { getAnalysisData } from './resume-list-item-analysis';
import { ResumeListItemActions } from './resume-list-item-actions';

type Props = {
  resume: UploadedResume;
  isDeleting: boolean;
  onDelete: (resume: UploadedResume) => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function ResumeListItem({ resume, isDeleting, onDelete }: Props) {
  const analysis = getAnalysisData(resume);

  return (
    <article className="grid grid-cols-1 gap-5 px-5 py-5 transition-colors hover:bg-white/[0.025] sm:px-6 xl:grid-cols-[minmax(0,1fr)_10rem_21rem] xl:items-center">
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/50">
          <FileText className="h-4 w-4" strokeWidth={1.6} />
        </span>

        <div className="min-w-0">
          <Link
            href={`/dashboard/resumes/${resume.id}`}
            title={resume.title}
            className="block truncate text-base font-medium text-foreground transition-opacity hover:opacity-65"
          >
            {resume.title}
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {resume.role || 'Роль не указана'}
          </p>
          <p className="mt-2 text-xs text-white/25">
            Обновлено {formatDate(resume.updated_at)}
          </p>
        </div>
      </div>

      <div className="min-w-0 pl-[3.35rem] xl:pl-0">
        <p className={`truncate text-xl font-medium leading-6 tracking-tight ${analysis.titleClassName}`}>
          {analysis.title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {analysis.subtitle}
        </p>
      </div>

      <ResumeListItemActions
        resume={resume}
        isDeleting={isDeleting}
        onDelete={onDelete}
      />
    </article>
  );
}

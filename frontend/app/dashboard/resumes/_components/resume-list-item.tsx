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
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function ResumeListItem({ resume, isDeleting, onDelete }: Props) {
  const analysis = getAnalysisData(resume);

  return (
    <div className="grid grid-cols-1 gap-5 px-6 py-5 transition-colors hover:bg-muted/40 xl:grid-cols-[minmax(0,1fr)_145px_auto] xl:items-center">
      <div className="flex min-w-0 items-start gap-4">
        <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 text-blue-300 ring-1 ring-blue-500/20">
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <Link
            href={`/dashboard/resumes/${resume.id}`}
            title={resume.title}
            className="block max-w-full cursor-pointer truncate text-base font-medium text-foreground hover:underline"
          >
            {resume.title}
          </Link>

          <p
            className="mt-1 max-w-full truncate text-sm text-muted-foreground"
            title={resume.role || 'Роль не указана'}
          >
            {resume.role || 'Роль не указана'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
              Загружено {formatDate(resume.created_at)}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
              0 адаптаций
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 xl:text-left">
        <p className="truncate text-xs uppercase tracking-widest text-muted-foreground">
          Статус анализа
        </p>
        <div className="mt-2">
          <p className={`truncate text-xl font-semibold ${analysis.titleClassName}`}>
            {analysis.title}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {analysis.subtitle}
          </p>
        </div>
      </div>

      <ResumeListItemActions
        resume={resume}
        isDeleting={isDeleting}
        onDelete={onDelete}
      />
    </div>
  );
}

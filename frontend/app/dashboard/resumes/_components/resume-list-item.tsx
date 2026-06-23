'use client';

import Link from 'next/link';
import { Download, FileText, MoreHorizontal, Trash2 } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { supabase } from '@/src/shared/lib/supabase/client';
import { useDownloadResumeMutation } from '@/src/shared/hooks/use-download-resume-mutation';

type ResumeListItemProps = {
  resume: UploadedResume;
  isDeleting: boolean;
  onDelete: (resume: UploadedResume) => void;
};

function getScoreColorClass(score: number | null) {
  if (score === null) {
    return 'text-foreground';
  }

  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-orange-400';
  }

  return 'text-red-400';
}

function getAnalysisData(resume: UploadedResume) {
  switch (resume.analysis_status) {
    case 'completed':
      return {
        title:
          resume.last_score === null ? 'Оценка не найдена' : `${resume.last_score}/100`,
        subtitle: 'Актуальна',
        titleClassName: getScoreColorClass(resume.last_score),
      };

    case 'analyzing':
      return {
        title: 'Анализируется',
        subtitle: 'Оценка в процессе',
        titleClassName: 'text-foreground',
      };

    case 'failed':
      return {
        title: 'Ошибка анализа',
        subtitle: 'Запустите повторно',
        titleClassName: 'text-red-400',
      };

    case 'needs_update':
      return {
        title: 'Требует обновления',
        subtitle: 'Резюме изменилось',
        titleClassName: 'text-orange-400',
      };

    case 'idle':
    case 'not_started':
    default:
      return {
        title: 'Не пройдена',
        subtitle: 'Запустите анализ',
        titleClassName: 'text-foreground',
      };
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function ResumeListItem({
  resume,
  isDeleting,
  onDelete,
}: ResumeListItemProps) {
  const analysis = getAnalysisData(resume);
  const downloadResumeMutation = useDownloadResumeMutation();

  const handleDownloadResume = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return;
    }

    downloadResumeMutation.mutate({
      resumeId: resume.id,
      accessToken: session.access_token,
      fileName: resume.file_name,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 px-6 py-5 transition-colors hover:bg-muted/40 xl:grid-cols-[minmax(0,1fr)_145px_auto] xl:items-center">
      <div className="flex min-w-0 items-start gap-4">
        <div className="shrink-0 rounded-xl bg-muted p-3">
          <FileText className="h-5 w-5 text-foreground" />
        </div>

        <div className="min-w-0">
          <Link
            href={`/dashboard/resumes/${resume.id}`}
            title={resume.title}
            className="block max-w-full truncate text-base font-medium text-foreground hover:underline"
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

      <div className="flex shrink-0 items-center gap-2 xl:justify-end">
        <Link
          href={`/dashboard/resumes/${resume.id}`}
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          Открыть
        </Link>

        <button
          type="button"
          onClick={handleDownloadResume}
          disabled={downloadResumeMutation.isPending}
          className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Скачать резюме"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(resume)}
          disabled={isDeleting}
          className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Удалить резюме"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Дополнительные действия"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
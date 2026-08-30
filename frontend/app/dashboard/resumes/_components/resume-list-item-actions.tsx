'use client';

import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useDownloadResumeMutation } from '@/src/shared/hooks/use-download-resume-mutation';
import { supabase } from '@/src/shared/lib/supabase/client';

type Props = {
  resume: UploadedResume;
  isDeleting: boolean;
  onDelete: (resume: UploadedResume) => void;
};

export function ResumeListItemActions({ resume, isDeleting, onDelete }: Props) {
  const downloadResumeMutation = useDownloadResumeMutation();
  const isCompleted = resume.analysis_status === 'completed';
  const primaryHref = isCompleted
    ? `/dashboard/adapt?resumeId=${resume.id}`
    : `/dashboard/analyze?resumeId=${resume.id}`;

  async function handleDownloadResume() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    downloadResumeMutation.mutate({
      resume,
      accessToken: session.access_token,
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
      <Link
        href={primaryHref}
        className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-brand-600 active:scale-[0.98]"
      >
        {isCompleted ? 'Адаптировать' : 'Оценить'}
      </Link>
      <Link
        href={`/dashboard/resumes/${resume.id}`}
        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.04]"
      >
        Открыть
      </Link>
      <button
        type="button"
        onClick={handleDownloadResume}
        disabled={downloadResumeMutation.isPending}
        className="rounded-xl border border-white/10 p-2.5 text-white/45 transition-[background-color,border-color,color] hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
        aria-label="Скачать резюме"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(resume)}
        disabled={isDeleting}
        className="rounded-xl border border-white/10 p-2.5 text-white/35 transition-[background-color,border-color,color] hover:border-red-400/25 hover:bg-red-400/[0.06] hover:text-red-300 disabled:opacity-40"
        aria-label="Удалить резюме"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

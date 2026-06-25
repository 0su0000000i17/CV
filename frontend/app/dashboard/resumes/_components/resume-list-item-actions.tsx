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

  const handleDownloadResume = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    downloadResumeMutation.mutate({
      resumeId: resume.id,
      accessToken: session.access_token,
      fileName: resume.file_name,
    });
  };

  return (
    <div className="flex shrink-0 items-center gap-2 xl:justify-end">
      <Link
        href={`/dashboard/resumes/${resume.id}`}
        className="cursor-pointer rounded-xl border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Открыть
      </Link>

      <button
        type="button"
        onClick={handleDownloadResume}
        disabled={downloadResumeMutation.isPending}
        className="cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Скачать резюме"
      >
        <Download className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(resume)}
        disabled={isDeleting}
        className="cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Удалить резюме"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { supabase } from '@/src/shared/lib/supabase/client';
import { useDeleteResumeMutation } from '@/src/shared/hooks/use-delete-resume-mutation';
import { useDownloadResumeMutation } from '@/src/shared/hooks/use-download-resume-mutation';
import { DeleteResumeDialog } from '../../_components/delete-resume-dialog';

type Props = {
  resume: UploadedResume;
};

function formatFileSize(size: number) {
  return `${Math.round(size / 1024)} KB`;
}

function getFileType(mimeType: string) {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('wordprocessingml')) return 'DOCX';
  if (mimeType.includes('msword')) return 'DOC';
  if (mimeType.includes('rtf')) return 'RTF';

  return 'Файл';
}

export function ResumeDetailsHeader({ resume }: Props) {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteResumeMutation = useDeleteResumeMutation();
  const downloadResumeMutation = useDownloadResumeMutation();

  const handleDownload = async () => {
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

  const handleConfirmDelete = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    deleteResumeMutation.mutate(
      {
        resumeId: resume.id,
        accessToken: session.access_token,
      },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          router.push('/dashboard/resumes');
        },
      }
    );
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/resumes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к резюме
        </Link>

        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Резюме
        </p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              {resume.title}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {resume.role || 'Роль не указана'} ·{' '}
              {getFileType(resume.file_type)} ·{' '}
              {formatFileSize(resume.file_size)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloadResumeMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Скачать
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteResumeMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          </div>
        </div>
      </div>

      {isDeleteDialogOpen ? (
        <DeleteResumeDialog
          resumeTitle={resume.title}
          isDeleting={deleteResumeMutation.isPending}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  );
}

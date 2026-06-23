'use client';

import { useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { supabase } from '@/src/shared/lib/supabase/client';
import { useDeleteResumeMutation } from '@/src/shared/hooks/use-delete-resume-mutation';

import { DeleteResumeDialog } from './delete-resume-dialog';
import { ResumeEmptyState } from './resume-empty-state';
import { ResumeListItem } from './resume-list-item';
import { ResumeListSkeleton } from './resume-list-skeleton';

type ResumesListProps = {
  resumes: UploadedResume[];
  isLoading: boolean;
};

export function ResumesList({ resumes, isLoading }: ResumesListProps) {
  const [resumeToDelete, setResumeToDelete] = useState<UploadedResume | null>(
    null
  );

  const deleteResumeMutation = useDeleteResumeMutation();

  const handleConfirmDelete = async () => {
    if (!resumeToDelete) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return;
    }

    deleteResumeMutation.mutate(
      {
        resumeId: resumeToDelete.id,
        accessToken: session.access_token,
      },
      {
        onSuccess: () => {
          setResumeToDelete(null);
        },
      }
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card/60">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-medium text-foreground">
              Загруженные файлы
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Откройте резюме, чтобы посмотреть версии, анализ и историю работы
              с файлом.
            </p>
          </div>
        </div>

        {isLoading ? (
          <ResumeListSkeleton />
        ) : resumes.length === 0 ? (
          <ResumeEmptyState />
        ) : (
          <div className="divide-y divide-border">
            {resumes.map((resume) => (
              <ResumeListItem
                key={resume.id}
                resume={resume}
                isDeleting={deleteResumeMutation.isPending}
                onDelete={setResumeToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {resumeToDelete ? (
        <DeleteResumeDialog
          resumeTitle={resumeToDelete.title}
          isDeleting={deleteResumeMutation.isPending}
          onCancel={() => setResumeToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  );
}

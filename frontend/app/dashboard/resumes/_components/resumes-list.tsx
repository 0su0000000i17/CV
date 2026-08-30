'use client';

import type { UploadedResume } from '@/src/shared/api/resumes';

import { DeleteResumeDialog } from './delete-resume-dialog';
import { ResumesListContent } from './resumes-list-content';
import { ResumesListToolbar } from './resumes-list-toolbar';
import { useResumesList } from './use-resumes-list';

type Props = { resumes: UploadedResume[]; isLoading: boolean; isError: boolean };

export function ResumesList({ resumes, isLoading, isError }: Props) {
  const state = useResumesList(resumes);
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.018]">
        <ResumesListToolbar
          filter={state.filter}
          hasResumes={resumes.length > 0}
          query={state.query}
          onFilterChange={state.setFilter}
          onQueryChange={state.setQuery}
        />
        <ResumesListContent
          allResumes={resumes}
          filteredResumes={state.filteredResumes}
          isDeleting={state.deleteMutation.isPending}
          isError={isError}
          isLoading={isLoading}
          onDelete={state.requestDelete}
        />
      </section>
      {state.resumeToDelete ? (
        <DeleteResumeDialog
          open={state.deleteDialogOpen}
          resumeTitle={state.resumeToDelete.title}
          isDeleting={state.deleteMutation.isPending}
          onCancel={() => state.setDeleteDialogOpen(false)}
          onConfirm={state.confirmDelete}
        />
      ) : null}
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useDeleteResumeMutation } from '@/src/shared/hooks/use-delete-resume-mutation';
import { supabase } from '@/src/shared/lib/supabase/client';

import { filterResumes, type ResumeFilter } from './resume-list-filter';

export function useResumesList(resumes: UploadedResume[]) {
  const [resumeToDelete, setResumeToDelete] = useState<UploadedResume | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ResumeFilter>('all');
  const deleteMutation = useDeleteResumeMutation();
  const filteredResumes = useMemo(
    () => filterResumes(resumes, query, filter),
    [filter, query, resumes]
  );

  useEffect(() => {
    if (deleteDialogOpen || !resumeToDelete) return;
    const timeoutId = window.setTimeout(() => setResumeToDelete(null), 240);
    return () => window.clearTimeout(timeoutId);
  }, [deleteDialogOpen, resumeToDelete]);

  function requestDelete(resume: UploadedResume) {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!resumeToDelete) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    deleteMutation.mutate(
      { resumeId: resumeToDelete.id, accessToken: session.access_token },
      { onSuccess: () => setDeleteDialogOpen(false) }
    );
  }

  return {
    confirmDelete,
    deleteDialogOpen,
    deleteMutation,
    filter,
    filteredResumes,
    query,
    requestDelete,
    resumeToDelete,
    setDeleteDialogOpen,
    setFilter,
    setQuery,
  };
}

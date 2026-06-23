'use client';

import { useEffect, useMemo } from 'react';

import { useDashboardResumeSelection } from '../../_components/DashboardResumeSelectionProvider';
import { createResumeRoute } from '../_lib/adapt-page-utils';

type RouterLike = {
  replace: (href: string) => void;
};

type ResumeListItem = {
  id: string;
};

type Params<TResume extends ResumeListItem> = {
  resumes: TResume[];
  resumeId: string | null;
  router: RouterLike;
  searchParamsString: string;
  onResetResult: () => void;
};

export function useSelectedResumeState<TResume extends ResumeListItem>({
  resumes,
  resumeId,
  router,
  searchParamsString,
  onResetResult,
}: Params<TResume>) {
  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const selectedResume = useMemo(() => {
    if (!resumes.length) {
      return undefined;
    }

    const candidateResumeIds = [resumeId, selectedResumeId].filter(
      (candidateResumeId): candidateResumeId is string =>
        Boolean(candidateResumeId)
    );

    for (const candidateResumeId of candidateResumeIds) {
      const foundResume = resumes.find(
        (resume) => resume.id === candidateResumeId
      );

      if (foundResume) {
        return foundResume;
      }
    }

    return resumes[0];
  }, [resumeId, resumes, selectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || selectedResumeId === selectedResume.id) {
      return;
    }

    setSelectedResumeId(selectedResume.id);
  }, [selectedResume?.id, selectedResumeId, setSelectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || resumeId === selectedResume.id) {
      return;
    }

    router.replace(
      createResumeRoute('/dashboard/adapt', searchParamsString, selectedResume.id)
    );
  }, [resumeId, router, searchParamsString, selectedResume?.id]);

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    onResetResult();

    router.replace(
      createResumeRoute('/dashboard/adapt', searchParamsString, nextResumeId)
    );
  }

  return {
    selectedResume,
    handleSelectResume,
  };
}

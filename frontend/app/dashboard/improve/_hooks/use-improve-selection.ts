'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../../_components/dashboard-resume-selection-provider';
import { createImproveRoute } from '../_lib/improve-route';
import type { UploadedResume } from '@/src/shared/api/resumes';

export function useImproveSelection(
  resumes: UploadedResume[],
  savedResumeId?: string,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeResumeId = searchParams.get('resumeId');
  const searchParamsString = searchParams.toString();
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const selectedResume = useMemo(() => {
    if (!resumes.length) return undefined;
    const ids = [routeResumeId, selectedResumeId, savedResumeId]
      .filter((value): value is string => Boolean(value));
    return ids.map((id) => resumes.find((resume) => resume.id === id)).find(Boolean)
      || resumes[0];
  }, [resumes, routeResumeId, savedResumeId, selectedResumeId]);

  useEffect(() => {
    if (selectedResume?.id && selectedResumeId !== selectedResume.id) {
      setSelectedResumeId(selectedResume.id);
    }
  }, [selectedResume?.id, selectedResumeId, setSelectedResumeId]);

  useEffect(() => {
    if (selectedResume?.id && routeResumeId !== selectedResume.id) {
      router.replace(createImproveRoute(searchParamsString, selectedResume.id));
    }
  }, [routeResumeId, router, searchParamsString, selectedResume?.id]);

  function navigateToResume(resumeId: string) {
    setSelectedResumeId(resumeId);
    router.replace(createImproveRoute(searchParamsString, resumeId));
  }

  return { selectedResume, navigateToResume };
}

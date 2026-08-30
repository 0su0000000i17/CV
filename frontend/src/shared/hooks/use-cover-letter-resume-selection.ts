import { useMemo, useState } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';

function getResumeIdFromUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('resumeId') ?? '';
}

export function useCoverLetterResumeSelection(resumes: UploadedResume[]) {
  const [resumeIdFromUrl] = useState(getResumeIdFromUrl);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const effectiveId = useMemo(() => {
    if (selectedResumeId) return selectedResumeId;
    return resumes.find((resume) => resume.id === resumeIdFromUrl)?.id ?? resumes[0]?.id ?? '';
  }, [resumeIdFromUrl, resumes, selectedResumeId]);
  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === effectiveId),
    [effectiveId, resumes]
  );
  return { effectiveId, selectedResume, setSelectedResumeId };
}

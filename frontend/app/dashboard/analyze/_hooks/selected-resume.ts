import type { UploadedResume } from '@/src/shared/api/resumes';

export function getSelectedResume(params: {
  resumes: UploadedResume[];
  resumeId: string | null;
  selectedResumeId: string | null;
}) {
  if (!params.resumes.length) return undefined;

  const candidateResumeIds = [params.resumeId, params.selectedResumeId].filter(
    (candidateResumeId): candidateResumeId is string => Boolean(candidateResumeId)
  );

  for (const candidateResumeId of candidateResumeIds) {
    const foundResume = params.resumes.find(
      (resume) => resume.id === candidateResumeId
    );

    if (foundResume) return foundResume;
  }

  return params.resumes[0];
}

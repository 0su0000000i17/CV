import type { UploadedResume } from '@/src/shared/api/resumes';

export function getFirstName(fullName?: string, email?: string) {
  const trimmedName = fullName?.trim();
  if (trimmedName) return trimmedName.split(/\s+/u)[0];
  return email?.split('@')[0]?.trim() || 'пользователь';
}

export function getCheckedResumes(resumes: UploadedResume[]) {
  return resumes.filter(
    (resume) => resume.analysis_status === 'completed' && resume.last_score !== null,
  );
}

export function getAverageScore(resumes: UploadedResume[]) {
  const checked = getCheckedResumes(resumes);
  if (!checked.length) return null;
  return Math.round(
    checked.reduce((sum, resume) => sum + (resume.last_score ?? 0), 0) / checked.length,
  );
}

export function getLatestCheckedResume(resumes: UploadedResume[]) {
  return [...getCheckedResumes(resumes)].sort(
    (first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime(),
  )[0];
}

export function createResumeActionHref(path: string, resumeId?: string) {
  return resumeId ? `${path}?resumeId=${encodeURIComponent(resumeId)}` : path;
}

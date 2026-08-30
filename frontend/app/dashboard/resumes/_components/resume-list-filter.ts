import type { UploadedResume } from '@/src/shared/api/resumes';

export type ResumeFilter = 'all' | 'completed' | 'attention';

export const resumeFilters: Array<{ value: ResumeFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'completed', label: 'Оценено' },
  { value: 'attention', label: 'Требуют действия' },
];

export function filterResumes(resumes: UploadedResume[], query: string, filter: ResumeFilter) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
  return resumes.filter((resume) => {
    const matchesQuery = !normalizedQuery
      || resume.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)
      || resume.role?.toLocaleLowerCase('ru-RU').includes(normalizedQuery);
    if (!matchesQuery) return false;
    if (filter === 'completed') return resume.analysis_status === 'completed';
    if (filter === 'attention') {
      return resume.analysis_status !== 'completed' && resume.analysis_status !== 'analyzing';
    }
    return true;
  });
}

import type { UploadedResume } from '@/src/shared/api/resumes';

function getScoreColorClass(score: number | null) {
  if (score === null) return 'text-foreground';
  return 'text-white';
}

export function getAnalysisData(resume: UploadedResume) {
  switch (resume.analysis_status) {
    case 'completed':
      return {
        title:
          resume.last_score === null ? 'Оценка не найдена' : `${resume.last_score}/100`,
        subtitle: 'Актуальна',
        titleClassName: getScoreColorClass(resume.last_score),
      };
    case 'analyzing':
      return {
        title: 'Анализируется',
        subtitle: 'Оценка в процессе',
        titleClassName: 'text-foreground',
      };
    case 'failed':
      return {
        title: 'Ошибка анализа',
        subtitle: 'Запустите повторно',
        titleClassName: 'text-red-400',
      };
    case 'needs_update':
      return {
        title: 'Требует обновления',
        subtitle: 'Резюме изменилось',
        titleClassName: 'text-amber-200',
      };
    default:
      return {
        title: 'Не пройдена',
        subtitle: 'Запустите анализ',
        titleClassName: 'text-foreground',
      };
  }
}

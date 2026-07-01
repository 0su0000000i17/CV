import type { ResumeRedFlag } from '@/src/shared/api/analyze';

export const redFlagLabels: Record<string, string> = {
  role_mismatch: 'Несоответствие роли',
  inflated_level: 'Завышенный уровень',
  career_transition: 'Переходная траектория',
  weak_evidence: 'Слабая доказательность',
  generic_responsibilities: 'Общие обязанности',
  keyword_stuffing: 'Перегруз навыками',
  poor_ats: 'ATS-проблемы',
  unclear_positioning: 'Неясное позиционирование',
  missing_metrics: 'Мало метрик',
  low_scanability: 'Профиль резюме раскрыт слабо',
  overlong_resume: 'Перегруженное резюме',
  inconsistent_titles: 'Несостыковка должностей',
};

export const severityLabels: Record<ResumeRedFlag['severity'], string> = {
  minor: 'Низкий риск',
  major: 'Средний риск',
  critical: 'Критичный риск',
};

export const severityClasses: Record<ResumeRedFlag['severity'], string> = {
  minor: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  major: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
};

import type { ResumeVacancyFitRiskFlag } from '@/src/shared/api/resumeVacancyFit';

export const fitLabels: Record<string, string> = {
  impossible: 'Не подходит',
  weak: 'Слабое совпадение',
  partial: 'Частично подходит',
  solid: 'Хорошо подходит',
  strong: 'Сильно подходит',
};

export const careerMoveLabels: Record<string, string> = {
  same_role: 'Та же роль',
  adjacent_role: 'Смежная роль',
  stretch_role: 'Растяжка роли',
  career_change: 'Смена профессии',
  unknown: 'Не определено',
};

export const adaptationModeLabels: Record<string, string> = {
  safe: 'Можно адаптировать',
  limited: 'Можно осторожно',
  blocked: 'Адаптация заблокирована',
};

export const riskFlagLabels: Record<ResumeVacancyFitRiskFlag['type'], string> = {
  role_mismatch: 'Несоответствие роли',
  missing_core_experience: 'Нет ключевого опыта',
  missing_required_skill: 'Нет обязательного навыка',
  level_mismatch: 'Несовпадение уровня',
  domain_mismatch: 'Другая доменная область',
  weak_evidence: 'Слабая доказательность',
  career_change: 'Смена профессии',
  over_adaptation_risk: 'Риск выдумывания опыта',
};

export const severityClasses: Record<
  ResumeVacancyFitRiskFlag['severity'],
  string
> = {
  minor: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  major: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
};

export const severityLabels: Record<
  ResumeVacancyFitRiskFlag['severity'],
  string
> = {
  minor: 'Низкий риск',
  major: 'Средний риск',
  critical: 'Критичный риск',
};

export function getScoreClass(score: number) {
  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-amber-400';
  }

  if (score >= 40) {
    return 'text-orange-400';
  }

  return 'text-red-400';
}

export function getStatusBadgeClass(canAdapt: boolean) {
  return canAdapt
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    : 'border-red-500/20 bg-red-500/10 text-red-300';
}

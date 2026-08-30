import type { ApplicationStatus } from '@/src/shared/api/applications';

export type TrackerFilter = 'all' | 'active' | 'interviews' | 'closed';

export const statusOptions: Array<{ value: ApplicationStatus; label: string }> = [
  { value: 'planned', label: 'Планирую' },
  { value: 'applied', label: 'Отклик отправлен' },
  { value: 'interview', label: 'Интервью' },
  { value: 'offer', label: 'Оффер' },
  { value: 'rejected', label: 'Отказ' },
  { value: 'withdrawn', label: 'Не актуально' },
];

export const filterOptions: Array<{ value: TrackerFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'В работе' },
  { value: 'interviews', label: 'Интервью' },
  { value: 'closed', label: 'Завершённые' },
];

export const statusClasses: Record<ApplicationStatus, string> = {
  planned: 'border-foreground/10 bg-foreground/[0.035] text-foreground/55',
  applied: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  interview: 'border-brand-400/25 bg-brand-500/10 text-brand-300',
  offer: 'border-brand-300/30 bg-brand-400/12 text-brand-300',
  rejected: 'border-brand-600/25 bg-brand-600/10 text-brand-400',
  withdrawn: 'border-foreground/10 bg-foreground/[0.025] text-foreground/40',
};

export function formatInterviewDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRubles(value: number) {
  const amount = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
    .format(value)
    .replace(/\u00a0/gu, ' ');
  return `${amount} ₽`;
}

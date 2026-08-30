export const eventLabels: Record<string, string> = {
  resume_uploaded: 'Загрузка резюме',
  resume_analyzed: 'Оценка резюме',
  vacancy_fit_checked: 'Проверка вакансии',
  resume_adapted: 'Адаптация резюме',
  cover_letter_generated: 'Сопроводительное',
};

export function formatAdminDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export type EditableWorkField = 'company' | 'companyCity' | 'companyUrl' | 'position';

export type WorkItemEditDraft = {
  company?: string | null;
  companyCity?: string | null;
  companyUrl?: string | null;
  companyIndustries?: string[];
  position?: string | null;
  dates?: string | null;
  description?: string | null;
  focus?: string | null;
  adaptedBullets: string[];
};

export const workMonths = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export function createWorkDescription(item: WorkItemEditDraft) {
  if (item.description?.trim()) return item.description;
  const focus = item.focus?.trim() || '';
  const bullets = item.adaptedBullets
    .map((value) => `- ${value.trim()}`)
    .filter((value) => value !== '- ');
  return [focus, bullets.length ? 'Достижения:' : '', ...bullets].filter(Boolean).join('\n');
}

export function parseWorkDates(value?: string | null) {
  const text = value?.trim() || '';
  const months = workMonths.join('|');
  const matches = Array.from(text.matchAll(new RegExp(`(${months})\\s+(\\d{4})`, 'giu')));
  return {
    startMonth: matches[0]?.[1] || '',
    startYear: matches[0]?.[2] || '',
    endMonth: matches[1]?.[1] || '',
    endYear: matches[1]?.[2] || '',
    isCurrent: /настоящее время|по настоящее время/iu.test(text),
  };
}

export function formatWorkDates(state: ReturnType<typeof parseWorkDates>) {
  const start = [state.startMonth, state.startYear].filter(Boolean).join(' ');
  const end = state.isCurrent
    ? 'настоящее время'
    : [state.endMonth, state.endYear].filter(Boolean).join(' ');
  return [start, end].filter(Boolean).join(' — ');
}

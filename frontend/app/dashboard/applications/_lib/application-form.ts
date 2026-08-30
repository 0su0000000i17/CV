import type { ApplicationInput, JobApplication } from '@/src/shared/api/applications';

export type ApplicationFormState = Omit<
  ApplicationInput,
  'interviewAt' | 'offerSalaryRub'
> & {
  interviewAt: string;
  offerSalaryRub: string;
};

type SearchParamReader = { get(name: string): string | null };

export function createInitialForm(params: SearchParamReader): ApplicationFormState {
  return {
    resumeId: params.get('resumeId'),
    resumeVariant: params.get('variant')?.trim() || 'Текущая версия',
    vacancyTitle: params.get('title')?.trim() || '',
    company: params.get('company')?.trim() || '',
    vacancyUrl: params.get('url')?.trim() || '',
    status: 'planned',
    interviewAt: '',
    offerSalaryRub: '',
    notes: '',
  };
}

export function createEmptyForm(): ApplicationFormState {
  return {
    vacancyTitle: '',
    company: null,
    vacancyUrl: null,
    resumeId: null,
    resumeVariant: 'Основная версия',
    status: 'applied',
    interviewAt: '',
    offerSalaryRub: '',
    notes: null,
  };
}

export function applicationToForm(item: JobApplication): ApplicationFormState {
  return {
    vacancyTitle: item.vacancy_title,
    company: item.company,
    vacancyUrl: item.vacancy_url,
    resumeId: item.resume_id,
    resumeVariant: item.resume_variant,
    status: item.status,
    interviewAt: toLocalDateTimeValue(item.interview_at),
    offerSalaryRub: item.offer_salary_rub ? String(item.offer_salary_rub) : '',
    notes: item.notes,
  };
}

export function toApplicationInput(form: ApplicationFormState): ApplicationInput {
  return {
    ...form,
    vacancyTitle: form.vacancyTitle.trim(),
    company: form.company?.trim() || null,
    vacancyUrl: form.vacancyUrl?.trim() || null,
    resumeId: form.resumeId || null,
    resumeVariant: form.resumeVariant.trim(),
    interviewAt: form.interviewAt ? new Date(form.interviewAt).toISOString() : null,
    offerSalaryRub:
      form.status === 'offer' && isOfferSalaryValid(form.offerSalaryRub)
        ? Number(form.offerSalaryRub)
        : null,
    notes: form.notes?.trim() || null,
  };
}

export function isApplicationFormValid(form: ApplicationFormState) {
  if (form.vacancyTitle.trim().length < 2) return false;
  return form.status !== 'offer' || isOfferSalaryValid(form.offerSalaryRub);
}

export function isOfferSalaryValid(value: string) {
  if (!/^\d+$/u.test(value)) return false;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= 1 && amount <= 1_000_000_000;
}

export function sanitizeRublesInput(value: string) {
  return value.replace(/\D/gu, '').replace(/^0+(?=\d)/u, '').slice(0, 10);
}

export function formatRublesInput(value: string) {
  if (!value) return '';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
    .format(Number(value))
    .replace(/\u00a0/gu, ' ');
}

function toLocalDateTimeValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

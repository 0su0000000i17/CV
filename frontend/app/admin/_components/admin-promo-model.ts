import type { AdminPromoCode } from '@/src/shared/api/admin';

export type PromoFormState = {
  code: string; targetEmail: string; description: string;
  discountType: 'percent' | 'fixed'; discountValue: string;
  maxRedemptions: string; perUserLimit: string; startsAt: string;
  expiresAt: string; personal: boolean;
};
export const defaultPromoForm: PromoFormState = {
  code: '', targetEmail: '', description: '', discountType: 'percent',
  discountValue: '20', maxRedemptions: '', perUserLimit: '1',
  startsAt: '', expiresAt: '', personal: false,
};
export const normalizePromoCode = (value: string) => value.replace(/\s+/g, '').toUpperCase();
export function normalizeDiscount(value: string, type: PromoFormState['discountType']) {
  const normalized = value.replace(',', '.');
  if (type !== 'percent') return normalized;
  const number = Number(normalized);
  return Number.isFinite(number) ? String(Math.min(100, Math.max(0, number))) : normalized;
}
export const toIsoDateTime = (value: string) => value ? new Date(value).toISOString() : null;
export function formatPromoDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value)) : '—';
}
export const discountLabel = (promo: AdminPromoCode) =>
  promo.discountType === 'percent' ? `${promo.discountValue}%` : `${promo.discountValue} ₽`;

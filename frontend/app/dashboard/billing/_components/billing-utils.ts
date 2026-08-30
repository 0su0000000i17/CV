import type { PromoCodeValidationResponse } from '@/src/shared/api/billing';

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function normalizePromoCode(value: string) {
  return value.replace(/\s+/g, '').toUpperCase();
}

function getDiscountAmountForPlan(
  promo: PromoCodeValidationResponse,
  amount: number
) {
  if (promo.promoCode.discountType === 'percent') {
    return Math.min(amount, Math.round((amount * promo.promoCode.discountValue) / 100));
  }

  return Math.min(amount, Math.round(promo.promoCode.discountValue));
}

export function applyPromoToPlan(
  promo: PromoCodeValidationResponse,
  amount: number
): PromoCodeValidationResponse {
  const discountAmount = getDiscountAmountForPlan(promo, amount);

  return {
    ...promo,
    originalAmount: amount,
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount),
  };
}

import { normalizeEmail } from "./input.js";
import {
  countPromoRedemptions,
  findPromoCode,
  getPromoTargetEmails,
} from "./promo-repository.js";
import type { PromoResolution } from "./types.js";

function calculateDiscount(type: string, value: number | string, amount: number) {
  const discount = Number(value);
  return Math.min(amount, Math.round(type === "percent" ? amount * discount / 100 : discount));
}

export async function resolvePromoForAmount(params: {
  userId: string;
  userEmail: string | null | undefined;
  code: string;
  amount: number;
}): Promise<PromoResolution> {
  const promo = await findPromoCode(params.code);
  if (!promo?.is_active) {
    return { error: { status: 404, message: "Промокод не найден или уже не действует" } };
  }
  const targets = await getPromoTargetEmails(promo.id);
  if (targets.length) {
    const email = normalizeEmail(params.userEmail);
    const allowed = new Set(targets.map(normalizeEmail));
    if (!email || !allowed.has(email)) {
      return { error: { status: 403, message: "Промокод доступен только для другого аккаунта" } };
    }
  }
  const now = new Date();
  if (promo.starts_at && now < new Date(promo.starts_at)) {
    return { error: { status: 400, message: "Промокод ещё не начал действовать" } };
  }
  if (promo.expires_at && now > new Date(promo.expires_at)) {
    return { error: { status: 400, message: "Срок действия промокода истёк" } };
  }
  const [total, userTotal] = await Promise.all([
    countPromoRedemptions(promo.id),
    countPromoRedemptions(promo.id, params.userId),
  ]);
  if (promo.max_redemptions !== null && total >= promo.max_redemptions) {
    return { error: { status: 400, message: "Лимит использований промокода исчерпан" } };
  }
  if (userTotal >= promo.per_user_limit) {
    return { error: { status: 400, message: "Вы уже использовали этот промокод" } };
  }
  const discountAmount = calculateDiscount(promo.discount_type, promo.discount_value, params.amount);
  return {
    promoCode: promo,
    discountAmount,
    finalAmount: Math.max(0, params.amount - discountAmount),
  };
}

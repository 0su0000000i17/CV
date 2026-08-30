import { toRecord } from "./input-coercion.js";
import {
  validatePromoPayload,
  type PromoCodeInput,
} from "./promo-code-validation.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

type TargetedPromoResult =
  | { error: string }
  | { value: { targetEmail: string; promoCode: PromoCodeInput } };

export function validateTargetedPromoPayload(value: unknown): TargetedPromoResult {
  const body = toRecord(value);
  const promo = validatePromoPayload(body);
  if ("error" in promo) return promo;
  const targetEmail = String(body.targetEmail ?? body.target_email ?? "")
    .trim()
    .toLowerCase();
  if (targetEmail.length > 320 || !EMAIL_PATTERN.test(targetEmail)) {
    return { error: "Target email is invalid" };
  }
  return { value: { targetEmail, promoCode: promo.value } };
}

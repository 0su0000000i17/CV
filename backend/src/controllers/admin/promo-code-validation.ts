import {
  toNullableInteger,
  toNullableIso,
  toNullableString,
  toPositiveInteger,
  toRecord,
} from "./input-coercion.js";

const DISCOUNT_TYPES = new Set(["percent", "fixed"]);

export type PromoCodeInput = {
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_redemptions: number | null;
  per_user_limit: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

type PromoValidationResult =
  | { error: string }
  | { value: PromoCodeInput };

function normalizeCode(value: unknown) {
  return String(value || "").replace(/\s+/gu, "").trim().toUpperCase();
}

function toDiscountValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? Math.round(number * 100) / 100
    : null;
}

export function validatePromoPayload(value: unknown): PromoValidationResult {
  const body = toRecord(value);
  const code = normalizeCode(body.code);
  const discountType = String(body.discountType || body.discount_type || "percent");
  const discountValue = toDiscountValue(body.discountValue ?? body.discount_value);
  const startsAt = toNullableIso(body.startsAt ?? body.starts_at);
  const expiresAt = toNullableIso(body.expiresAt ?? body.expires_at);

  if (!/^[A-Z0-9_-]{3,32}$/u.test(code)) {
    return { error: "Promo code must contain 3-32 latin letters, numbers, _ or -" };
  }
  if (!DISCOUNT_TYPES.has(discountType)) return { error: "Invalid discount type" };
  if (discountValue === null) return { error: "Invalid discount value" };
  if (discountType === "percent" && discountValue > 100) {
    return { error: "Percent discount cannot be greater than 100" };
  }
  if (startsAt && expiresAt && startsAt >= expiresAt) {
    return { error: "Expiration date must be after start date" };
  }

  return {
    value: {
      code,
      description: toNullableString(body.description),
      discount_type: discountType,
      discount_value: discountValue,
      max_redemptions: toNullableInteger(body.maxRedemptions ?? body.max_redemptions),
      per_user_limit: toPositiveInteger(body.perUserLimit ?? body.per_user_limit, 1),
      starts_at: startsAt,
      expires_at: expiresAt,
      is_active: typeof body.isActive === "boolean" ? body.isActive : body.is_active !== false,
    },
  };
}

export function createPromoPatch(value: unknown) {
  const body = toRecord(value);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ("description" in body) patch.description = toNullableString(body.description);
  if ("isActive" in body) patch.is_active = body.isActive === true;
  if ("is_active" in body) patch.is_active = body.is_active === true;
  if ("maxRedemptions" in body || "max_redemptions" in body) {
    patch.max_redemptions = toNullableInteger(body.maxRedemptions ?? body.max_redemptions);
  }
  if ("perUserLimit" in body || "per_user_limit" in body) {
    patch.per_user_limit = toPositiveInteger(body.perUserLimit ?? body.per_user_limit, 1);
  }
  if ("startsAt" in body || "starts_at" in body) {
    patch.starts_at = toNullableIso(body.startsAt ?? body.starts_at);
  }
  if ("expiresAt" in body || "expires_at" in body) {
    patch.expires_at = toNullableIso(body.expiresAt ?? body.expires_at);
  }
  return patch;
}

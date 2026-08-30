export const PROMO_CODE_COLUMNS =
  "id, code, description, discount_type, discount_value, max_redemptions, " +
  "per_user_limit, starts_at, expires_at, is_active, created_by, created_at, updated_at";

export type PromoCodeRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number | string;
  max_redemptions: number | null;
  per_user_limit: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
};

export function mapPromoCode(row: PromoCodeRow, redemptionsCount: number) {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    maxRedemptions: row.max_redemptions,
    perUserLimit: row.per_user_limit,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    redemptionsCount,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

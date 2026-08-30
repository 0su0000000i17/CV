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
};

export type PromoResolution =
  | { error: { status: number; message: string } }
  | { promoCode: PromoCodeRow; discountAmount: number; finalAmount: number };

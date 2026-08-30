import { supabaseAdmin } from "../../lib/supabase.js";
import type { PromoCodeRow } from "./types.js";

const PROMO_COLUMNS =
  "id, code, description, discount_type, discount_value, max_redemptions, " +
  "per_user_limit, starts_at, expires_at, is_active";

export async function findPromoCode(code: string) {
  const { data, error } = await supabaseAdmin.from("promo_codes")
    .select(PROMO_COLUMNS).eq("code", code).maybeSingle();
  if (error) throw error;
  return data as PromoCodeRow | null;
}

export async function countPromoRedemptions(promoCodeId: string, userId?: string) {
  let query = supabaseAdmin.from("promo_code_redemptions")
    .select("id", { count: "exact", head: true }).eq("promo_code_id", promoCodeId);
  if (userId) query = query.eq("user_id", userId);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getPromoTargetEmails(promoCodeId: string) {
  const { data, error } = await supabaseAdmin.from("promo_code_targets")
    .select("email").eq("promo_code_id", promoCodeId);
  if (error) throw error;
  return (data ?? []).map((row) => row.email as string);
}

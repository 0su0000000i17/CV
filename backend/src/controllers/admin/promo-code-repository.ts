import { supabaseAdmin } from "../../lib/supabase.js";
import { PROMO_CODE_COLUMNS, type PromoCodeRow } from "./promo-code-model.js";

type RedemptionRow = { promo_code_id: string };

export async function listPromoCodes() {
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select(PROMO_CODE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1_000);
  if (error) throw error;
  return (data ?? []) as unknown as PromoCodeRow[];
}

export async function countRedemptionsByPromoCode(ids: string[]) {
  const counts = new Map<string, number>();
  if (!ids.length) return counts;

  const pageSize = 1_000;
  for (let from = 0; from < 50_000; from += pageSize) {
    const { data, error } = await supabaseAdmin
      .from("promo_code_redemptions")
      .select("promo_code_id")
      .in("promo_code_id", ids)
      .range(from, from + pageSize - 1);
    if (error) throw error;

    const rows = (data ?? []) as RedemptionRow[];
    for (const row of rows) {
      counts.set(row.promo_code_id, (counts.get(row.promo_code_id) ?? 0) + 1);
    }
    if (rows.length < pageSize) break;
  }
  return counts;
}

export async function insertPromoCode(values: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .insert(values)
    .select(PROMO_CODE_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as PromoCodeRow;
}

export async function updatePromoCode(id: string, patch: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .update(patch)
    .eq("id", id)
    .select(PROMO_CODE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PromoCodeRow | null;
}

export async function countPromoRedemptions(id: string) {
  const { count, error } = await supabaseAdmin
    .from("promo_code_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("promo_code_id", id);
  if (error) throw error;
  return count ?? 0;
}

import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../lib/supabase.js";
import { TOKEN_COSTS, WELCOME_TOKENS, type TokenFeature } from "./plans.js";
import { parseInsufficientTokens } from "./token-errors.js";

export { InsufficientTokensError, sendInsufficientTokens } from "./token-errors.js";
export { listTokenTransactions, refundTaskTokens } from "./token-ledger.js";

/**
 * Pre-generated id shared between the token charge and the task row it pays
 * for: the ledger's (task_type, task_id) uniqueness then guarantees
 * exactly-once charge AND exactly-once refund for that task, no matter how
 * many times either call is retried.
 */
export function createChargedTaskId() {
  return randomUUID();
}

export async function getTokenBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("ensure_token_balance", {
    p_user_id: userId,
    p_welcome_amount: WELCOME_TOKENS,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function spendTokensForFeature(params: {
  userId: string;
  feature: TokenFeature;
  taskType: string;
  taskId: string;
}): Promise<number> {
  const { error, data } = await supabaseAdmin.rpc("spend_tokens", {
    p_user_id: params.userId,
    p_amount: TOKEN_COSTS[params.feature],
    p_feature: params.feature,
    p_task_type: params.taskType,
    p_task_id: params.taskId,
  });

  if (error) {
    const insufficient = parseInsufficientTokens(error);
    if (insufficient) throw insufficient;
    throw error;
  }

  return Number(data ?? 0);
}

/**
 * Best-effort: a failed refund must never crash the task-failure path it is
 * called from (the user can always be made whole manually via the ledger),
 * but it is logged loudly because it means someone paid for a failed task.
 */
export async function grantTokens(params: {
  userId: string;
  amount: number;
  reason: "purchase" | "admin_grant" | "promo";
  paymentId?: string | null;
  grantedBy?: string | null;
  note?: string | null;
}): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("grant_tokens", {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_reason: params.reason,
    p_payment_id: params.paymentId ?? null,
    p_granted_by: params.grantedBy ?? null,
    p_note: params.note ?? null,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

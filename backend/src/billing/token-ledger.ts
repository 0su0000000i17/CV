import { supabaseAdmin } from "../lib/supabase.js";
import { getSafeErrorMessage } from "../utils/api-responses.js";

export async function refundTaskTokens(params: {
  taskType: string;
  taskId: string;
  note?: string;
}): Promise<number | undefined> {
  const { data, error } = await supabaseAdmin.rpc("refund_task_tokens", {
    p_task_type: params.taskType,
    p_task_id: params.taskId,
    p_note: params.note ?? null,
  });
  if (error) {
    console.error("[tokens] REFUND FAILED - user paid for a failed task", {
      taskType: params.taskType,
      taskId: params.taskId,
      error: getSafeErrorMessage(error),
    });
    return undefined;
  }
  return data === null || data === undefined ? undefined : Number(data);
}

type TokenTransactionRow = {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  feature: string | null;
  note: string | null;
  created_at: string;
};

export async function listTokenTransactions(userId: string, limit = 50) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const { data, error } = await supabaseAdmin
    .from("token_transactions")
    .select("id, amount, balance_after, reason, feature, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []) as TokenTransactionRow[];
}

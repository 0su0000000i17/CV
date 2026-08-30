import { supabaseAdmin } from "../lib/supabase.js";
import { getSafeErrorMessage } from "./api-responses.js";

// Generous daily ceiling per AI task type, per user. Exists as a backstop
// against a single account looping requests within the rate-limit window
// over a long period; tunable via env without touching call sites.
const DAILY_TASK_LIMIT_PER_USER =
  Number(process.env.AI_TASK_DAILY_LIMIT_PER_USER) || 100;

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

/**
 * Returns true if the given user has already created
 * DAILY_TASK_LIMIT_PER_USER (or more) rows in `table` today.
 * Fails open (returns false) on DB errors so a transient issue never blocks
 * a legitimate user - the IP-based rate limiter is the primary backstop.
 */
export async function isDailyTaskQuotaExceeded(table: string, userId: string) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfTodayUtc());

  if (error) {
    console.error(`[task-quota] Failed to check quota for ${table}:`, getSafeErrorMessage(error));
    return false;
  }

  return (count ?? 0) >= DAILY_TASK_LIMIT_PER_USER;
}

export const DAILY_TASK_QUOTA_MESSAGE =
  "Дневной лимит запросов исчерпан. Попробуйте снова завтра.";

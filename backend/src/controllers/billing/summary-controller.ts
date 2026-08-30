import type { Request, Response } from "express";

import { BILLING_PLANS, findBillingPlan, TOKEN_COSTS, WELCOME_TOKENS } from "../../billing/plans.js";
import { getTokenBalance, listTokenTransactions } from "../../billing/token-service.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";

async function getCurrentPlanLabel(userId: string) {
  const { data, error } = await supabaseAdmin.from("payments").select("plan_id")
    .eq("user_id", userId).eq("status", "succeeded")
    .order("confirmed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? findBillingPlan(data.plan_id)?.name ?? null : null;
}

export async function getTokenSummary(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, errorMessage || "Unauthorized");
    const [balance, currentPlan] = await Promise.all([
      getTokenBalance(user.id),
      getCurrentPlanLabel(user.id),
    ]);
    return res.json({
      balance,
      currentPlan,
      welcomeTokens: WELCOME_TOKENS,
      costs: TOKEN_COSTS,
      plans: BILLING_PLANS,
    });
  } catch (error) {
    return sendServerError(res, "Не удалось получить баланс кредитов", error);
  }
}

export async function getMyTokenTransactions(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, errorMessage || "Unauthorized");
    return res.json({ transactions: await listTokenTransactions(user.id, 50) });
  } catch (error) {
    return sendServerError(res, "Не удалось получить историю операций", error);
  }
}

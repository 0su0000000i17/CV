import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { getAuthUserEmails } from "./query.js";

export async function getAdminPayments(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, plan_id, amount_rub, tokens, status, provider, promo_code, discount_rub, confirmed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const userIds = [...new Set((payments ?? []).map((payment) => payment.user_id))];
    const emails = await getAuthUserEmails(userIds);
    return res.json({
      payments: (payments ?? []).map((payment) => ({
        ...payment,
        email: emails.get(payment.user_id) ?? null,
      })),
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch payments", error);
  }
}

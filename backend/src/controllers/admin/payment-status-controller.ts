import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { uuidSchema } from "./admin-input.js";
import { requireAdminOrSendError } from "./controller-access.js";

function parsePaymentId(req: Request, res: Response) {
  const parsed = uuidSchema.safeParse(req.params.paymentId);
  if (!parsed.success) sendError(res, 400, "Invalid payment id");
  return parsed.success ? parsed.data : null;
}

export async function confirmAdminPayment(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;
    const paymentId = parsePaymentId(req, res);
    if (!paymentId) return null;
    const { data: balance, error } = await supabaseAdmin.rpc("confirm_payment_and_grant", {
      p_payment_id: paymentId,
      p_confirmed_by: admin.user.id,
    });
    if (error) {
      if (error.message.includes("PAYMENT_NOT_FOUND")) {
        return sendError(res, 404, "Платёж не найден");
      }
      if (error.message.includes("PAYMENT_NOT_PENDING")) {
        return sendError(res, 409, "Платёж уже обработан (не в статусе pending)");
      }
      if (error.message.includes("PROMO_")) {
        return sendError(res, 409, "Промокод больше нельзя применить к этому платежу");
      }
      throw error;
    }
    return res.json({ paymentId, balance: Number(balance ?? 0) });
  } catch (error) {
    return sendServerError(res, "Failed to confirm payment", error);
  }
}

export async function cancelAdminPayment(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;
    const paymentId = parsePaymentId(req, res);
    if (!paymentId) return null;
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", paymentId)
      .eq("status", "pending")
      .select("id, status")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendError(res, 409, "Платёж не найден или уже обработан");
    return res.json({ payment: data });
  } catch (error) {
    return sendServerError(res, "Failed to cancel payment", error);
  }
}

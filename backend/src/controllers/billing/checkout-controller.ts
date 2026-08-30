import type { Request, Response } from "express";

import { findBillingPlan } from "../../billing/plans.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { normalizePromoCode } from "./input.js";
import { resolvePromoForAmount } from "./resolve-promo.js";
import type { PromoCodeRow } from "./types.js";

export async function createCheckout(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, errorMessage || "Unauthorized");
    const plan = findBillingPlan(req.body?.planId);
    if (!plan) return sendError(res, 400, "Неизвестный тариф");
    const code = normalizePromoCode(req.body?.promoCode);
    let discountAmount = 0;
    let finalAmount = plan.priceRub;
    let promo: PromoCodeRow | null = null;
    if (req.body?.promoCode && !code) {
      return sendError(res, 400, "Некорректный промокод");
    }
    if (code) {
      const resolution = await resolvePromoForAmount({
        userId: user.id,
        userEmail: user.email,
        code,
        amount: plan.priceRub,
      });
      if ("error" in resolution) {
        return sendError(res, resolution.error.status, resolution.error.message);
      }
      promo = resolution.promoCode;
      discountAmount = resolution.discountAmount;
      finalAmount = resolution.finalAmount;
    }
    const { data, error } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_rub: finalAmount,
      tokens: plan.tokens,
      status: "pending",
      provider: "manual",
      promo_code_id: promo?.id ?? null,
      promo_code: promo?.code ?? null,
      discount_rub: discountAmount,
    }).select("id, plan_id, amount_rub, tokens, status, created_at").single();
    if (error) throw error;
    return res.status(201).json({ payment: data });
  } catch (error) {
    return sendServerError(res, "Не удалось создать счёт на оплату", error);
  }
}

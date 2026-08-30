import type { Request, Response } from "express";

import { sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { normalizePromoCode, toAmount } from "./input.js";
import { resolvePromoForAmount } from "./resolve-promo.js";

export async function validatePromoCode(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, errorMessage || "Unauthorized");
    const code = normalizePromoCode(req.body?.code);
    const amount = toAmount(req.body?.amount);
    if (!code) return sendError(res, 400, "Введите корректный промокод");
    if (amount === null) return sendError(res, 400, "Некорректная сумма тарифа");
    if (amount === 0) {
      return sendError(res, 400, "Промокод нельзя применить к бесплатному тарифу");
    }
    const resolution = await resolvePromoForAmount({
      userId: user.id,
      userEmail: user.email,
      code,
      amount,
    });
    if ("error" in resolution) {
      return sendError(res, resolution.error.status, resolution.error.message);
    }
    return res.json({
      promoCode: {
        id: resolution.promoCode.id,
        code: resolution.promoCode.code,
        description: resolution.promoCode.description,
        discountType: resolution.promoCode.discount_type,
        discountValue: Number(resolution.promoCode.discount_value),
        startsAt: resolution.promoCode.starts_at,
        expiresAt: resolution.promoCode.expires_at,
      },
      originalAmount: amount,
      discountAmount: resolution.discountAmount,
      finalAmount: resolution.finalAmount,
    });
  } catch (error) {
    return sendServerError(res, "Не удалось проверить промокод", error);
  }
}

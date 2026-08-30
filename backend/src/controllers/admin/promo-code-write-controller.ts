import type { Request, Response } from "express";
import { z } from "zod";

import { sendError, sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { mapPromoCode } from "./promo-code-model.js";
import {
  countPromoRedemptions,
  insertPromoCode,
  updatePromoCode,
} from "./promo-code-repository.js";
import { createPromoPatch, validatePromoPayload } from "./promo-code-validation.js";

export async function createAdminPromoCode(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;

    const parsed = validatePromoPayload(req.body);
    if ("error" in parsed) {
      return sendError(res, 400, parsed.error || "Invalid promo code payload");
    }

    const promoCode = await insertPromoCode({
      ...parsed.value,
      created_by: admin.user.id,
    });
    return res.status(201).json({ promoCode: mapPromoCode(promoCode, 0) });
  } catch (error) {
    return sendServerError(res, "Failed to create promo code", error);
  }
}

export async function updateAdminPromoCode(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;

    const id = z.string().uuid().safeParse(req.params.promoCodeId);
    if (!id.success) return sendError(res, 400, "Invalid promo code id");

    const promoCode = await updatePromoCode(id.data, createPromoPatch(req.body));
    if (!promoCode) return sendError(res, 404, "Promo code not found");

    const redemptions = await countPromoRedemptions(id.data);
    return res.json({ promoCode: mapPromoCode(promoCode, redemptions) });
  } catch (error) {
    return sendServerError(res, "Failed to update promo code", error);
  }
}

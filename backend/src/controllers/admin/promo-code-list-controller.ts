import type { Request, Response } from "express";

import { sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { mapPromoCode } from "./promo-code-model.js";
import {
  countRedemptionsByPromoCode,
  listPromoCodes,
} from "./promo-code-repository.js";

export async function getAdminPromoCodes(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;

    const promoCodes = await listPromoCodes();
    const counts = await countRedemptionsByPromoCode(promoCodes.map((item) => item.id));
    return res.json({
      promoCodes: promoCodes.map((row) => mapPromoCode(row, counts.get(row.id) ?? 0)),
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch promo codes", error);
  }
}

import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { uuidSchema } from "./admin-input.js";
import { requireAdminOrSendError } from "./controller-access.js";

export async function deleteAdminPromoCode(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;
    const id = uuidSchema.safeParse(req.params.promoCodeId);
    if (!id.success) return sendError(res, 400, "Invalid promo code id");
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .delete()
      .eq("id", id.data)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendError(res, 404, "Promo code not found");
    return res.json({ success: true });
  } catch (error) {
    return sendServerError(res, "Failed to delete promo code", error);
  }
}

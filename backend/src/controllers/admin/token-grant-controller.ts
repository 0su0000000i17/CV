import type { Request, Response } from "express";
import { z } from "zod";

import { grantTokens } from "../../billing/token-service.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";

const MAX_GRANT_AMOUNT = 100_000;
const grantSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().int().min(1).max(MAX_GRANT_AMOUNT),
  note: z.coerce.string().trim().max(300).optional(),
});

export async function grantAdminTokens(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;
    const parsed = grantSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(
        res,
        400,
        `Проверьте пользователя и сумму от 1 до ${MAX_GRANT_AMOUNT}`,
      );
    }
    const { userId, amount, note } = parsed.data;
    const target = await supabaseAdmin.auth.admin.getUserById(userId);
    if (target.error || !target.data?.user) {
      return sendError(res, 404, "Пользователь не найден");
    }
    const balance = await grantTokens({
      userId,
      amount,
      reason: "admin_grant",
      grantedBy: admin.user.id,
      note: note || null,
    });
    return res.json({ userId, balance });
  } catch (error) {
    return sendServerError(res, "Failed to grant tokens", error);
  }
}

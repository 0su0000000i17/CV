import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { requireApplicationUser } from "./helpers.js";

export async function deleteApplicationController(req: Request, res: Response) {
  const user = await requireApplicationUser(req, res);
  if (!user) return;
  const applicationId = z.string().uuid().safeParse(req.params.applicationId);
  if (!applicationId.success) return sendError(res, 400, "Некорректный отклик");
  try {
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .delete()
      .eq("id", applicationId.data)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendError(res, 404, "Отклик не найден");
    return res.json({ success: true });
  } catch (error) {
    return sendServerError(res, "Не удалось удалить отклик", error);
  }
}

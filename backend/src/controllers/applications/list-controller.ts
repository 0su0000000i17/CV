import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendServerError } from "../../utils/api-responses.js";
import { requireApplicationUser } from "./helpers.js";

export async function listApplicationsController(req: Request, res: Response) {
  const user = await requireApplicationUser(req, res);
  if (!user) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return res.json({ applications: data || [] });
  } catch (error) {
    return sendServerError(res, "Не удалось загрузить отклики", error);
  }
}

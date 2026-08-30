import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";

export async function deleteResume(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (findError) return sendServerError(res, "Failed to find resume", findError);
    if (!resume) return sendError(res, 404, "Resume not found");

    if (resume.file_path) {
      const { error } = await supabaseAdmin.storage
        .from("resumes")
        .remove([resume.file_path]);
      if (error) return sendServerError(res, "Failed to delete resume file", error);
    }
    const { error } = await supabaseAdmin
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);
    if (error) return sendServerError(res, "Failed to delete resume", error);
    return res.json({ success: true });
  } catch (error) {
    return sendServerError(res, "Unexpected resume delete error", error);
  }
}

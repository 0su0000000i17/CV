import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function getResumeAdaptationsSummaryController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const { count, error } = await supabaseAdmin
      .from("adaptation_tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("resume_id", resume.id)
      .eq("status", "completed")
      .not("result", "is", null);

    if (error) throw error;

    return res.json({
      resumeId: resume.id,
      count: count ?? 0,
    });
  } catch (error) {
    return sendServerError(res, "Failed to get resume adaptations summary", error);
  }
}

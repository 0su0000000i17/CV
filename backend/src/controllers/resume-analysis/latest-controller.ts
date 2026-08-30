import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { mapAnalysisRow } from "../../resume-analysis/presenter.js";
import { findLatestResumeAnalysis } from "../../resume-analysis/repositories/resume-analyses-repository.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";

export async function getLatestResumeAnalysis(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const { data: resume, error } = await supabaseAdmin.from("resumes")
      .select("id, analysis_status")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!resume) return sendError(res, 404, "Resume not found");
    const latest = await findLatestResumeAnalysis({ userId: user.id, resumeId });
    if (!latest) {
      return res.json({
        resumeId,
        analysis: null,
        analysisRecord: null,
        meta: null,
        stale: false,
      });
    }
    return res.json({
      ...mapAnalysisRow(latest),
      stale: resume.analysis_status !== "completed",
    });
  } catch (error) {
    return sendServerError(res, "Unexpected latest analysis fetch error", error);
  }
}

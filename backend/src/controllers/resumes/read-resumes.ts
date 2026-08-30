import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";

export async function getResumes(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, "Unauthorized");
    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return sendServerError(res, "Failed to fetch resumes", error);
    return res.json({ resumes: data });
  } catch (error) {
    return sendServerError(res, "Unexpected resumes fetch error", error);
  }
}

export async function getResumeById(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return sendServerError(res, "Failed to fetch resume", error);
    if (!data) return sendError(res, 404, "Resume not found");
    return res.json({ resume: data });
  } catch (error) {
    return sendServerError(res, "Unexpected resume fetch error", error);
  }
}

export async function getResumeDownloadUrl(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (findError) return sendServerError(res, "Failed to find resume", findError);
    if (!resume) return sendError(res, 404, "Resume not found");
    if (!resume.file_path) {
      return sendError(res, 404, "Original file is not stored for this resume");
    }
    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 60);
    if (error) return sendServerError(res, "Failed to create download url", error);
    return res.json({ downloadUrl: data.signedUrl });
  } catch (error) {
    return sendServerError(res, "Unexpected download url error", error);
  }
}

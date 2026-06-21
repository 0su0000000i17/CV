import type { Request, Response } from "express";

import { analyzeResume } from "../ai/services/analyzeResume.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { extractResumeMarkdown } from "../resume-processing/extractResumeMarkdown.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/apiResponses.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function analyzeResumePreview(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!resumeId) {
      return sendError(res, 400, "Invalid resume id");
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_name, file_path, file_type, file_size")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) {
      return sendServerError(res, "Failed to find resume", findError);
    }

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.file_path);

    if (downloadError) {
      return sendServerError(
        res,
        "Failed to download resume file",
        downloadError
      );
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());

    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    const aiResult = await analyzeResume({
      resumeMarkdown: extraction.markdown,
    });

    return res.json({
      resumeId: resume.id,
      analysis: aiResult.analysis,
meta: {
  provider: aiResult.provider,
  model: aiResult.model,
  markdownChars: extraction.stats.returnedChars,
  markdownLimited: extraction.stats.limited,
  diagnostics: aiResult.diagnostics,
},
    });
  } catch (error) {
    return sendServerError(res, "Failed to analyze resume", error);
  }
}
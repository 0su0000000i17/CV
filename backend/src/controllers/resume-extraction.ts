import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { sendError, sendServerError, getStringParam } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function extractResumeTextPreview(req: Request, res: Response) {
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

    return res.json({
      resumeId: resume.id,
      fileName: resume.file_name,
      fileType: resume.file_type,
      fileSize: resume.file_size,
      stats: extraction.stats,
      markdown: extraction.markdown,
    });
  } catch (error) {
    return sendServerError(res, "Failed to extract resume text", error);
  }
}
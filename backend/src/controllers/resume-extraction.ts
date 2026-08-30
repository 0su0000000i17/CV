import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { extractHhResume } from "../resume-processing/extract-hh-resume.js";
import { sendError, sendServerError, getStringParam } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function extractResumeTextPreview(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_name, file_path, file_type, file_size, extracted_text")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) return sendServerError(res, "Failed to find resume", findError);
    if (!resume) return sendError(res, 404, "Resume not found");

    const savedText = resume.extracted_text?.trim();
    if (savedText) {
      return res.json({
        resumeId: resume.id,
        fileName: resume.file_name,
        fileType: resume.file_type,
        fileSize: resume.file_size,
        stats: {
          rawChars: savedText.length,
          normalizedChars: savedText.length,
          sanitizedChars: savedText.length,
          returnedChars: savedText.length,
          limited: false,
        },
        markdown: savedText,
      });
    }

    if (!resume.file_path) {
      return sendError(res, 404, "Resume source text is not available");
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.file_path);
    if (downloadError) return sendServerError(res, "Failed to download resume file", downloadError);

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    const extraction = await extractHhResume({
      fileBuffer,
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

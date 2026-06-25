import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../lib/supabase.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

const updateResumeTextSchema = z.object({
  markdown: z.string().trim().min(40).max(80_000),
});

type EditableResumeRecord = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
};

async function findEditableResume(userId: string, resumeId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_name, file_path, file_type, file_size, extracted_text")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as EditableResumeRecord | null;
}

export async function getEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findEditableResume(user.id, resumeId);

    if (!resume) return sendError(res, 404, "Resume not found");

    if (resume.extracted_text?.trim()) {
      return res.json({
        status: "ok",
        resumeId: resume.id,
        source: "saved_edit",
        markdown: resume.extracted_text,
        stats: null,
      });
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.file_path);

    if (downloadError) {
      return sendServerError(res, "Failed to download resume file", downloadError);
    }

    const extraction = await extractResumeMarkdown({
      fileBuffer: Buffer.from(await fileData.arrayBuffer()),
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    return res.json({
      status: "ok",
      resumeId: resume.id,
      source: "original_file",
      markdown: extraction.markdown,
      stats: extraction.stats,
    });
  } catch (error) {
    return sendServerError(res, "Failed to get editable resume text", error);
  }
}

export async function updateEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const parsedBody = updateResumeTextSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(res, 400, "Некорректный текст резюме.");
    }

    const updatedAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .update({
        extracted_text: parsedBody.data.markdown,
        analysis_status: "needs_update",
        last_score: null,
        updated_at: updatedAt,
      })
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) return sendServerError(res, "Failed to update resume text", error);
    if (!data) return sendError(res, 404, "Resume not found");

    return res.json({
      status: "updated",
      resume: data,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected resume text update error", error);
  }
}
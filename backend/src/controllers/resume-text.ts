import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../lib/supabase.js";
import {
  extractEditableResume,
  extractEditableResumeContacts,
} from "../resume-editor/extract-editable-resume.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

const updateResumeTextSchema = z.object({
  markdown: z.string().max(80_000).optional(),
  resumeJson: z
    .unknown()
    .refine(
      (value) => Boolean(value) && typeof value === "object",
      "Resume editor data is required"
    ),
});

type EditableResumeRecord = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  editable_resume_json: unknown | null;
};

async function findEditableResume(userId: string, resumeId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select(
      "id, file_name, file_path, file_type, file_size, extracted_text, editable_resume_json"
    )
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as EditableResumeRecord | null;
}

async function extractOriginalResumeMarkdown(resume: EditableResumeRecord) {
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("resumes")
    .download(resume.file_path);

  if (downloadError) throw downloadError;

  return extractResumeMarkdown({
    fileBuffer: Buffer.from(await fileData.arrayBuffer()),
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });
}

async function persistEditableResume(params: {
  resumeId: string;
  userId: string;
  markdown: string;
  resumeJson: unknown;
}) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      extracted_text: params.markdown,
      editable_resume_json: params.resumeJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.resumeId)
    .eq("user_id", params.userId);

  if (error) {
    console.error("[resumeText] Failed to persist editable resume", error);
  }
}

async function persistExtractedText(params: {
  resumeId: string;
  userId: string;
  markdown: string;
}) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      extracted_text: params.markdown,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.resumeId)
    .eq("user_id", params.userId);

  if (error) {
    console.error("[resumeText] Failed to persist extracted text", error);
  }
}

async function createEditableResponse(params: {
  resume: EditableResumeRecord;
  userId: string;
  markdown: string;
  source: "saved_edit" | "original_file";
  stats: unknown | null;
}) {
  const extracted = await extractEditableResume(params.markdown);

  if (extracted.extractor.mode === "ai") {
    await persistEditableResume({
      resumeId: params.resume.id,
      userId: params.userId,
      markdown: params.markdown,
      resumeJson: extracted.resumeJson,
    });
  } else if (params.source === "original_file") {
    await persistExtractedText({
      resumeId: params.resume.id,
      userId: params.userId,
      markdown: params.markdown,
    });
  }

  return {
    status: "ok",
    resumeId: params.resume.id,
    source: params.source,
    markdown: params.markdown,
    resumeJson: extracted.resumeJson,
    contacts: extracted.contacts,
    stats: params.stats,
    extractor: extracted.extractor,
  };
}

export async function getEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findEditableResume(user.id, resumeId);

    if (!resume) return sendError(res, 404, "Resume not found");

    if (resume.extracted_text?.trim() && resume.editable_resume_json) {
      return res.json({
        status: "ok",
        resumeId: resume.id,
        source: "saved_json",
        markdown: resume.extracted_text,
        resumeJson: resume.editable_resume_json,
        contacts: extractEditableResumeContacts(resume.extracted_text),
        stats: null,
        extractor: { mode: "saved_json", provider: null, model: null },
      });
    }

    if (resume.extracted_text?.trim()) {
      return res.json(
        await createEditableResponse({
          resume,
          userId: user.id,
          markdown: resume.extracted_text,
          source: "saved_edit",
          stats: null,
        })
      );
    }

    let extraction: Awaited<ReturnType<typeof extractResumeMarkdown>>;

    try {
      extraction = await extractOriginalResumeMarkdown(resume);
    } catch (error) {
      return sendServerError(res, "Failed to download resume file", error);
    }

    return res.json(
      await createEditableResponse({
        resume,
        userId: user.id,
        markdown: extraction.markdown,
        source: "original_file",
        stats: extraction.stats,
      })
    );
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
      return sendError(res, 400, "Некорректные данные редактора резюме.");
    }

    const updatedAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .update({
        editable_resume_json: parsedBody.data.resumeJson,
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
import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../lib/supabase.js";
import { extractEditableResume } from "../resume-editor/extract-editable-resume.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

const updateResumeTextSchema = z.object({
  resumeJson: z.unknown().refine(
    (value) => Boolean(value) && typeof value === "object",
    "Resume editor data is required"
  ),
});

type EditableResumeRecord = {
  id: string;
  file_name: string;
  file_path: string | null;
  file_type: string;
  extracted_text: string | null;
  editable_resume_json: unknown | null;
  source_resume_document: unknown | null;
};

async function findEditableResume(userId: string, resumeId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_name, file_path, file_type, extracted_text, editable_resume_json, source_resume_document")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as EditableResumeRecord | null;
}

async function extractOriginalMarkdown(resume: EditableResumeRecord) {
  if (!resume.file_path) throw new Error("Resume has no legacy source file");
  const { data, error } = await supabaseAdmin.storage.from("resumes").download(resume.file_path);
  if (error) throw error;
  return extractResumeMarkdown({
    fileBuffer: Buffer.from(await data.arrayBuffer()),
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });
}

async function persistParsedResume(params: {
  userId: string;
  resumeId: string;
  markdown: string;
  resumeJson: unknown;
  sourceDocument: unknown;
}) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      extracted_text: params.markdown,
      editable_resume_json: params.resumeJson,
      source_resume_document: params.sourceDocument,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.resumeId)
    .eq("user_id", params.userId);
  if (error) console.error("[resumeText] Failed to persist parsed resume", error);
}

function createResponse(params: {
  resume: EditableResumeRecord;
  markdown: string;
  source: "saved_json" | "saved_edit" | "original_file";
  stats: unknown | null;
}) {
  const extracted = extractEditableResume(params.markdown);
  const resumeJson = params.resume.editable_resume_json || extracted.resumeJson;
  const document = params.resume.source_resume_document || extracted.document;
  return {
    status: "ok",
    resumeId: params.resume.id,
    source: params.source,
    markdown: params.markdown,
    resumeJson,
    contacts: extracted.contacts,
    document,
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

    const savedMarkdown = resume.extracted_text?.trim();
    if (savedMarkdown) {
      const source = resume.editable_resume_json ? "saved_json" : "saved_edit";
      return res.json(createResponse({ resume, markdown: savedMarkdown, source, stats: null }));
    }

    const extraction = await extractOriginalMarkdown(resume);
    const markdown = extraction.normalizedMarkdown;
    const response = createResponse({ resume, markdown, source: "original_file", stats: extraction.stats });
    await persistParsedResume({
      userId: user.id,
      resumeId: resume.id,
      markdown,
      resumeJson: response.resumeJson,
      sourceDocument: response.document,
    });
    return res.json(response);
  } catch (error) {
    return sendServerError(res, "Failed to get editable resume text", error);
  }
}

export async function updateEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const parsedBody = updateResumeTextSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!parsedBody.success) return sendError(res, 400, "Некорректные данные редактора резюме.");

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .update({ editable_resume_json: parsedBody.data.resumeJson, analysis_status: "needs_update", last_score: null, updated_at: new Date().toISOString() })
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (error) return sendServerError(res, "Failed to update resume text", error);
    if (!data) return sendError(res, 404, "Resume not found");
    return res.json({ status: "updated", resume: data });
  } catch (error) {
    return sendServerError(res, "Unexpected resume text update error", error);
  }
}

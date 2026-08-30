import { supabaseAdmin } from "../../lib/supabase.js";
import { extractHhResume } from "../../resume-processing/extract-hh-resume.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";
import type { EditableResumeRecord } from "./types.js";

const COLUMNS =
  "id, file_name, file_path, file_type, extracted_text, editable_resume_json, " +
  "source_resume_document";

export async function findEditableResume(userId: string, resumeId: string) {
  const { data, error } = await supabaseAdmin.from("resumes").select(COLUMNS)
    .eq("id", resumeId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as EditableResumeRecord | null;
}

export async function extractOriginalResume(resume: EditableResumeRecord) {
  if (!resume.file_path) throw new Error("Resume has no source file");
  const { data, error } = await supabaseAdmin.storage.from("resumes").download(resume.file_path);
  if (error) throw error;
  return extractHhResume({
    fileBuffer: Buffer.from(await data.arrayBuffer()),
    mimeType: resume.file_type,
  });
}

export async function persistParsedResume(params: {
  userId: string;
  resumeId: string;
  markdown: string;
  resumeJson: unknown;
  sourceDocument: unknown;
}) {
  const { error } = await supabaseAdmin.from("resumes").update({
    extracted_text: params.markdown,
    editable_resume_json: params.resumeJson,
    source_resume_document: params.sourceDocument,
    updated_at: new Date().toISOString(),
  }).eq("id", params.resumeId).eq("user_id", params.userId);
  if (error) {
    console.error("[resumeText] Failed to persist parsed resume:", getSafeErrorMessage(error));
  }
}

export async function saveEditableResume(params: {
  userId: string;
  resumeId: string;
  update: Record<string, unknown>;
}) {
  const { data, error } = await supabaseAdmin.from("resumes").update(params.update)
    .eq("id", params.resumeId).eq("user_id", params.userId).select().maybeSingle();
  if (error) throw error;
  return data;
}

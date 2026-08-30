import { supabaseAdmin } from "../../lib/supabase.js";
import { extractHhResume } from "../../resume-processing/extract-hh-resume.js";
import { isCurrentSourceResumeDocument } from "../../resume-document/version.js";

export type ResumeSourceRecord = {
  id: string;
  title: string | null;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
  source_resume_document: unknown | null;
};

export async function readOriginalFileBuffer(resume: ResumeSourceRecord) {
  if (!resume.file_path) return null;
  const result = await supabaseAdmin.storage.from("resumes").download(resume.file_path);
  if (result.error) throw result.error;
  return Buffer.from(await result.data.arrayBuffer());
}

export async function readOriginalText(
  resume: ResumeSourceRecord,
  fileBuffer: Buffer | null
) {
  const savedText = resume.extracted_text?.trim();
  if (savedText) return savedText;
  if (!fileBuffer) return "";
  const extraction = await extractHhResume({ fileBuffer, mimeType: resume.file_type });
  return extraction.normalizedMarkdown.trim();
}

export function storedSourceDocument(resume: ResumeSourceRecord) {
  return isCurrentSourceResumeDocument(resume.source_resume_document)
    ? resume.source_resume_document
    : null;
}

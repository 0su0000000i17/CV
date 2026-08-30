import { supabaseAdmin } from "../../lib/supabase.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import { extractHhResume } from "../../resume-processing/extract-hh-resume.js";
import { attachFilePhoto } from "./source-photo.js";
import {
  readOriginalFileBuffer,
  readOriginalText,
  storedSourceDocument,
  type ResumeSourceRecord,
} from "./source-record.js";
import { sourceDocumentFromText } from "./source-repair.js";

export type ResumeExportSource = ResumeSourceRecord & {
  sourceText: string;
  sourceDocument: SourceResumeDocument | null;
};

export async function getResumeExportSource(params: {
  userId: string;
  resumeId: string;
}): Promise<ResumeExportSource | null> {
  const result = await supabaseAdmin
    .from("resumes")
    .select("id, title, file_name, file_path, file_type, extracted_text, source_resume_document")
    .eq("id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (result.error) throw result.error;

  const resume = result.data as ResumeSourceRecord | null;
  if (!resume) return null;
  const existing = storedSourceDocument(resume);
  const needsOriginalFile = Boolean(
    resume.file_path &&
    (!existing || !resume.extracted_text?.trim() || !existing.photo?.dataUrl)
  );
  const fileBuffer = needsOriginalFile ? await readOriginalFileBuffer(resume) : null;
  let sourceText = await readOriginalText(resume, fileBuffer);
  let sourceDocument = sourceDocumentFromText(resume, sourceText);

  if (!existing && fileBuffer) {
    const extraction = await extractHhResume({
      fileBuffer,
      mimeType: resume.file_type,
    });
    sourceText = extraction.normalizedMarkdown;
    sourceDocument = extraction.document;
  }

  sourceDocument = await attachFilePhoto({ resume, sourceDocument, fileBuffer });
  return { ...resume, sourceText, sourceDocument };
}

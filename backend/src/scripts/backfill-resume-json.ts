import "dotenv/config";

import { supabaseAdmin } from "../lib/supabase.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { isCurrentSourceResumeDocument } from "../resume-document/version.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import { extractPhotoFromPdf } from "../resume-profile/extract-photo-from-pdf.js";
import { extractHhResume } from "../resume-processing/extract-hh-resume.js";
import { readStoredResumePhoto } from "./backfill-resume-photo.js";

type ResumeRow = {
  id: string;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
  source_resume_document: unknown | null;
  editable_resume_json: unknown | null;
};

const shouldConfirm = process.argv.includes("--confirm");

async function fetchRows() {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_name, file_path, file_type, extracted_text, source_resume_document, editable_resume_json");

  if (error) throw error;
  return ((data || []) as ResumeRow[]).filter((row) =>
    !isCurrentSourceResumeDocument(row.source_resume_document) ||
    !row.editable_resume_json ||
    !row.extracted_text
  );
}

async function extractRow(row: ResumeRow) {
  if (!row.file_path) {
    const markdown = row.extracted_text?.trim();
    return markdown
      ? { markdown, document: parseSourceResumeDocument(markdown) }
      : null;
  }

  const fileResult = await supabaseAdmin.storage.from("resumes").download(row.file_path);
  if (fileResult.error) throw fileResult.error;

  const fileBuffer = Buffer.from(await fileResult.data.arrayBuffer());
  const extraction = await extractHhResume({
    fileBuffer,
    mimeType: row.file_type,
  });
  const storedPhoto = readStoredResumePhoto(row.source_resume_document);
  const extractedPhoto = storedPhoto ? null : await extractPhotoFromPdf({
    fileBuffer,
    mimeType: row.file_type,
  });
  const photo = storedPhoto || (extractedPhoto
    ? {
        contentType: extractedPhoto.contentType,
        dataUrl: `data:${extractedPhoto.contentType};base64,${extractedPhoto.buffer.toString("base64")}`,
        displayWidth: extractedPhoto.displayWidth,
        displayHeight: extractedPhoto.displayHeight,
      }
    : null);
  const document = photo ? { ...extraction.document, photo } : extraction.document;

  return { markdown: extraction.normalizedMarkdown, document };
}

async function backfillRow(row: ResumeRow) {
  const extracted = await extractRow(row);
  if (!extracted) {
    console.warn(`[backfill] Skip ${row.id}: no text or source file`);
    return;
  }

  const { markdown, document } = extracted;
  const editable = sourceDocumentToEditableResume(document);

  if (!shouldConfirm) {
    console.info(`[backfill] Ready ${row.id}: ${editable.resumeJson.target.title || "resume"}`);
    return;
  }

  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      extracted_text: markdown,
      source_resume_document: document,
      editable_resume_json: editable.resumeJson,
      role: editable.resumeJson.target.title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) throw error;
  console.info(`[backfill] Updated ${row.id}`);
}

async function main() {
  const rows = await fetchRows();
  console.info(`[backfill] Rows to inspect: ${rows.length}`);

  for (const row of rows) {
    await backfillRow(row);
  }

  if (!shouldConfirm) {
    console.info("[backfill] Dry run only. Add --confirm to write JSON to DB.");
  }
}

main().catch((error) => { console.error("[backfill] Failed", error); process.exitCode = 1; });

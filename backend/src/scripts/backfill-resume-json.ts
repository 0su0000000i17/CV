import "dotenv/config";

import { supabaseAdmin } from "../lib/supabase.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";

type ResumeRow = {
  id: string;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
};

const shouldConfirm = process.argv.includes("--confirm");

async function fetchRows() {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_name, file_path, file_type, extracted_text")
    .or("source_resume_document.is.null,editable_resume_json.is.null,extracted_text.is.null");

  if (error) throw error;
  return (data || []) as ResumeRow[];
}

async function getMarkdown(row: ResumeRow) {
  const savedText = row.extracted_text?.trim();
  if (savedText) return savedText;
  if (!row.file_path) return null;

  const fileResult = await supabaseAdmin.storage.from("resumes").download(row.file_path);
  if (fileResult.error) throw fileResult.error;

  const fileBuffer = Buffer.from(await fileResult.data.arrayBuffer());
  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: row.file_name,
    filePath: row.file_path,
    mimeType: row.file_type,
  });

  return extraction.normalizedMarkdown;
}

async function backfillRow(row: ResumeRow) {
  const markdown = await getMarkdown(row);
  if (!markdown) {
    console.warn(`[backfill] Skip ${row.id}: no text or source file`);
    return;
  }

  const document = parseSourceResumeDocument(markdown);
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

main().catch((error) => {
  console.error("[backfill] Failed", error);
  process.exitCode = 1;
});

import { supabaseAdmin } from "../../lib/supabase.js";
import { extractResumeMarkdown } from "../../resume-processing/extract-resume-markdown.js";

export type ResumeSourceRecord = {
  id: string;
  title: string | null;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
};

export type ResumeExportSource = ResumeSourceRecord & {
  sourceText: string;
};

async function readOriginalText(resume: ResumeSourceRecord) {
  const savedText = resume.extracted_text?.trim();
  if (savedText) return savedText;

  if (!resume.file_path) return "";

  const result = await supabaseAdmin.storage
    .from("resumes")
    .download(resume.file_path);

  if (result.error) throw result.error;

  const fileBuffer = Buffer.from(await result.data.arrayBuffer());
  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  return extraction.normalizedMarkdown.trim();
}

export async function getResumeExportSource(params: {
  userId: string;
  resumeId: string;
}): Promise<ResumeExportSource | null> {
  const result = await supabaseAdmin
    .from("resumes")
    .select("id, title, file_name, file_path, file_type, extracted_text")
    .eq("id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (result.error) throw result.error;

  const resume = result.data as ResumeSourceRecord | null;
  if (!resume) return null;

  return {
    ...resume,
    sourceText: await readOriginalText(resume),
  };
}

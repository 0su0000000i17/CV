import { supabaseAdmin } from "../../lib/supabase.js";
import { parseSourceResumeDocument } from "../../resume-document/parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import { extractPhotoFromPdf } from "../../resume-profile/extract-photo-from-pdf.js";
import { extractResumeMarkdown } from "../../resume-processing/extract-resume-markdown.js";

export type ResumeSourceRecord = {
  id: string;
  title: string | null;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
  source_resume_document: unknown | null;
};

export type ResumeExportSource = ResumeSourceRecord & {
  sourceText: string;
  sourceDocument: SourceResumeDocument | null;
};

function createPhotoDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function readOriginalFileBuffer(resume: ResumeSourceRecord) {
  if (!resume.file_path) return null;

  const result = await supabaseAdmin.storage.from("resumes").download(resume.file_path);
  if (result.error) throw result.error;

  return Buffer.from(await result.data.arrayBuffer());
}

async function readOriginalText(resume: ResumeSourceRecord, fileBuffer: Buffer | null) {
  const savedText = resume.extracted_text?.trim();
  if (savedText) return savedText;
  if (!fileBuffer) return "";

  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  return extraction.normalizedMarkdown.trim();
}

function resolveSourceDocument(resume: ResumeSourceRecord, sourceText: string) {
  if (resume.source_resume_document) {
    return resume.source_resume_document as SourceResumeDocument;
  }

  if (!sourceText.trim()) return null;

  return parseSourceResumeDocument(sourceText);
}

async function attachStoredFilePhoto(params: {
  resume: ResumeSourceRecord;
  sourceDocument: SourceResumeDocument | null;
  fileBuffer: Buffer | null;
}) {
  const { resume, sourceDocument, fileBuffer } = params;

  if (!sourceDocument || sourceDocument.photo?.dataUrl || !fileBuffer) {
    return sourceDocument;
  }

  const photo = await extractPhotoFromPdf({
    fileBuffer,
    mimeType: resume.file_type,
  });

  if (!photo) return sourceDocument;

  return {
    ...sourceDocument,
    photo: {
      contentType: photo.contentType,
      dataUrl: createPhotoDataUrl(photo.buffer, photo.contentType),
      displayWidth: photo.displayWidth,
      displayHeight: photo.displayHeight,
    },
  };
}

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

  const storedDocument = resume.source_resume_document as SourceResumeDocument | null;
  const needsOriginalFile = Boolean(
    resume.file_path && (!resume.extracted_text?.trim() || !storedDocument?.photo?.dataUrl)
  );
  const fileBuffer = needsOriginalFile ? await readOriginalFileBuffer(resume) : null;
  const sourceText = await readOriginalText(resume, fileBuffer);
  const sourceDocument = await attachStoredFilePhoto({
    resume,
    sourceDocument: resolveSourceDocument(resume, sourceText),
    fileBuffer,
  });

  return {
    ...resume,
    sourceText,
    sourceDocument,
  };
}

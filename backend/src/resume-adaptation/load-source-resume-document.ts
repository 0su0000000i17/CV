import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";

type ResumeFileRecord = {
  file_name: string;
  file_path: string | null;
  file_type: string;
  extracted_text?: string | null;
  source_resume_document?: unknown | null;
};

export type LoadedSourceResumeDocument = {
  document: SourceResumeDocument;
  markdown: string;
  markdownLimited: boolean;
};

export async function loadSourceResumeDocument(
  resume: ResumeFileRecord
): Promise<LoadedSourceResumeDocument> {
  const savedMarkdown = resume.extracted_text?.trim();

  if (resume.source_resume_document && savedMarkdown) {
    return {
      document: resume.source_resume_document as SourceResumeDocument,
      markdown: savedMarkdown,
      markdownLimited: false,
    };
  }

  if (savedMarkdown) {
    return {
      document: parseSourceResumeDocument(savedMarkdown),
      markdown: savedMarkdown,
      markdownLimited: false,
    };
  }

  if (!resume.file_path) {
    throw new Error("Resume has no stored JSON, text or legacy file");
  }

  const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  return {
    document: parseSourceResumeDocument(extraction.normalizedMarkdown),
    markdown: extraction.normalizedMarkdown,
    markdownLimited: extraction.stats.limited,
  };
}

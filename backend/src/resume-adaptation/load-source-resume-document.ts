import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { isCurrentSourceResumeDocument } from "../resume-document/version.js";
import { extractHhResume } from "../resume-processing/extract-hh-resume.js";

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
  if (isCurrentSourceResumeDocument(resume.source_resume_document)) {
    return {
      document: resume.source_resume_document,
      markdown: resume.extracted_text?.trim() || "",
      markdownLimited: false,
    };
  }

  if (resume.file_path) {
    const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    const extraction = await extractHhResume({ fileBuffer, mimeType: resume.file_type });
    return {
      document: extraction.document,
      markdown: extraction.normalizedMarkdown,
      markdownLimited: extraction.stats.limited,
    };
  }

  const savedMarkdown = resume.extracted_text?.trim();
  if (savedMarkdown) {
    return {
      document: parseSourceResumeDocument(savedMarkdown),
      markdown: savedMarkdown,
      markdownLimited: false,
    };
  }

  throw new Error("Resume has no stored JSON, text or source file");
}

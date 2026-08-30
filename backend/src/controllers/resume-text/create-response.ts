import { extractEditableResume } from "../../resume-editor/extract-editable-resume.js";
import { sourceDocumentToEditableResume } from "../../resume-editor/source-document-to-editable.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import { isCurrentSourceResumeDocument } from "../../resume-document/version.js";
import { mergeResumeJsonWithDocument } from "./merge-resume-json.js";
import type { EditableResumeRecord } from "./types.js";

export function createEditableResponse(params: {
  resume: EditableResumeRecord;
  markdown: string;
  source: "saved_json" | "saved_edit" | "original_file";
  stats: unknown | null;
  sourceDocument?: SourceResumeDocument | null;
}) {
  const stored = isCurrentSourceResumeDocument(params.resume.source_resume_document)
    ? params.resume.source_resume_document : null;
  const legacyDocument = params.resume.source_resume_document as Partial<SourceResumeDocument> | null;
  const legacyPhoto = legacyDocument?.photo;
  const selected = params.sourceDocument || stored;
  const preferred = selected && legacyPhoto?.dataUrl && !selected.photo?.dataUrl
    ? { ...selected, photo: legacyPhoto } : selected;
  const extracted = preferred ? null : extractEditableResume(params.markdown);
  const parsed = extracted
    ? legacyPhoto?.dataUrl && !extracted.document.photo?.dataUrl
      ? { ...extracted.document, photo: legacyPhoto }
      : extracted.document
    : null;
  const document = preferred || parsed;
  if (!document) throw new Error("Resume source document is not available");
  const editable = sourceDocumentToEditableResume(document);
  return {
    status: "ok",
    resumeId: params.resume.id,
    source: params.source,
    markdown: params.markdown,
    resumeJson: mergeResumeJsonWithDocument(params.resume.editable_resume_json, editable.resumeJson),
    contacts: editable.contacts,
    document,
    stats: params.stats,
    extractor: extracted?.extractor || {
      mode: "source_document",
      provider: document.meta.parser || null,
      model: null,
    },
  };
}

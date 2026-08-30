import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "./source-document-to-editable.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";

export type EditableResumeExtractionResult = {
  contacts: EditableResumeContacts;
  resumeJson: EditableResumeJson;
  document: SourceResumeDocument;
  extractor: {
    mode: "source_document";
    provider: null;
    model: null;
  };
};

export function extractEditableResume(markdown: string): EditableResumeExtractionResult {
  const document = parseSourceResumeDocument(markdown);
  const editable = sourceDocumentToEditableResume(document);

  return {
    ...editable,
    document,
    extractor: {
      mode: "source_document",
      provider: null,
      model: null,
    },
  };
}

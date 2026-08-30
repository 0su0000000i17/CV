import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicExportPayload, SourceSnapshot } from "../types.js";
import { cleanText } from "../text.js";
import { educationFromSource } from "./source-document-lines.js";

export function resolveEducationLines(params: {
  payload: ClassicExportPayload;
  snapshot: SourceSnapshot;
  sourceDocument: SourceResumeDocument | null;
}) {
  const documentLines = educationFromSource(params.sourceDocument);
  if (documentLines.length) return documentLines;
  const notes = params.payload.adaptation.adaptedResume.education.notes
    .map(cleanText)
    .filter(Boolean);
  return notes.length ? notes : params.snapshot.educationLines;
}

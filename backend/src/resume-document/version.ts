import {
  SOURCE_RESUME_DOCUMENT_VERSION,
  type SourceResumeDocument,
} from "./types.js";

export function isCurrentSourceResumeDocument(
  value: unknown
): value is SourceResumeDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return (value as { version?: unknown }).version === SOURCE_RESUME_DOCUMENT_VERSION;
}

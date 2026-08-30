import type { SourceResumeDocument } from "../resume-document/types.js";

type SourcePhoto = NonNullable<SourceResumeDocument["photo"]>;

export function readStoredResumePhoto(value: unknown): SourcePhoto | null {
  if (!isRecord(value) || !isRecord(value.photo)) return null;
  const photo = value.photo;
  if (typeof photo.contentType !== "string" || typeof photo.dataUrl !== "string") {
    return null;
  }

  return {
    contentType: photo.contentType,
    dataUrl: photo.dataUrl,
    displayWidth: optionalNumber(photo.displayWidth),
    displayHeight: optionalNumber(photo.displayHeight),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

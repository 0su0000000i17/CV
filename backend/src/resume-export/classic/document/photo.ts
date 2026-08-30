import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicExportPayload } from "../types.js";
import { cleanText } from "../text.js";

function normalizePhotoSize(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
    : null;
}

function sourcePhotoUrl(document: SourceResumeDocument | null) {
  const photo = document?.photo;
  const width = normalizePhotoSize(photo?.displayWidth);
  const height = normalizePhotoSize(photo?.displayHeight);
  if (width && height && (width < 45 || height < 45)) return null;
  return cleanText(photo?.dataUrl) || null;
}

export function resolvePhotoUrl(
  payload: ClassicExportPayload,
  document: SourceResumeDocument | null,
) {
  return cleanText(payload.photoUrl) || sourcePhotoUrl(document);
}

export function resolvePhotoSize(
  payload: ClassicExportPayload,
  document: SourceResumeDocument | null,
) {
  const selected = resolvePhotoUrl(payload, document);
  if (!selected || selected !== cleanText(document?.photo?.dataUrl)) return null;
  const width = normalizePhotoSize(document?.photo?.displayWidth);
  const height = normalizePhotoSize(document?.photo?.displayHeight);
  return width && height ? { width, height } : null;
}

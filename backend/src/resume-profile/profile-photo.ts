import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { extractPhotoFromPdf } from "./extract-photo-from-pdf.js";

export type ExtractedPhotoResponse = {
  contentType: string;
  dataUrl: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
} | null;

function normalizePhoto(photo: ExtractedPhotoResponse): ExtractedPhotoResponse {
  if (!photo) return null;
  const width = Number(photo.displayWidth) || 0;
  const height = Number(photo.displayHeight) || 0;
  const isSmall = width > 0 && height > 0 && width <= 120 && height <= 120;
  const isSquare = width > 0 && height > 0 && Math.abs(width - height) <= 10;
  const tooSmall = width > 0 && height > 0 && (width < 45 || height < 45);
  return tooSmall || (isSmall && isSquare && photo.dataUrl.length < 6_000)
    ? null
    : photo;
}

export function photoResponse(photo: {
  buffer: Buffer;
  contentType: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
} | null): ExtractedPhotoResponse {
  if (!photo) return null;
  return normalizePhoto({
    contentType: photo.contentType,
    dataUrl: `data:${photo.contentType};base64,${photo.buffer.toString("base64")}`,
    displayWidth: photo.displayWidth,
    displayHeight: photo.displayHeight,
  });
}

export function storedPhotoResponse(photo: {
  contentType: string;
  dataUrl: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
} | null | undefined) {
  return normalizePhoto(photo?.dataUrl ? photo : null);
}

export async function tryExtractStoredFilePhoto(resume: {
  file_path: string | null;
  file_type: string | null;
}) {
  if (!resume.file_path) return null;
  try {
    const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    return photoResponse(await extractPhotoFromPdf({
      fileBuffer,
      mimeType: resume.file_type,
    }));
  } catch {
    return null;
  }
}

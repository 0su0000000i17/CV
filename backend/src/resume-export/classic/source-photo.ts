import type { SourceResumeDocument } from "../../resume-document/types.js";
import { extractPhotoFromPdf } from "../../resume-profile/extract-photo-from-pdf.js";
import type { ResumeSourceRecord } from "./source-record.js";

export async function attachFilePhoto(params: {
  resume: ResumeSourceRecord;
  sourceDocument: SourceResumeDocument | null;
  fileBuffer: Buffer | null;
}) {
  const { resume, sourceDocument, fileBuffer } = params;
  if (!sourceDocument || sourceDocument.photo?.dataUrl || !fileBuffer) {
    return sourceDocument;
  }
  const photo = await extractPhotoFromPdf({ fileBuffer, mimeType: resume.file_type });
  if (!photo) return sourceDocument;
  return {
    ...sourceDocument,
    photo: {
      contentType: photo.contentType,
      dataUrl: `data:${photo.contentType};base64,${photo.buffer.toString("base64")}`,
      displayWidth: photo.displayWidth,
      displayHeight: photo.displayHeight,
    },
  };
}

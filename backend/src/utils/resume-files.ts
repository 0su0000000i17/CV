import crypto from "node:crypto";

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_RESUME_PDF_PAGES = 20;

export const allowedResumeMimeTypes = ["application/pdf"];

const PDF_MAGIC_BYTES = Buffer.from("%PDF-", "latin1");

export function isPdfBuffer(buffer: Buffer) {
  return buffer.subarray(0, PDF_MAGIC_BYTES.length).equals(PDF_MAGIC_BYTES);
}

export function decodeFileName(fileName: string) {
  return Buffer.from(fileName, "latin1").toString("utf8");
}

// Extension is derived only from the validated MIME type, never from the
// user-supplied original filename, so a spoofed filename can't influence
// what gets stored/served as the file extension.
function getFileExtension(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    default:
      return "file";
  }
}

export function createResumeStorageFilePath(
  userId: string,
  mimeType: string
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = getFileExtension(mimeType);
  const uniqueFileName = `resume-${crypto.randomUUID()}.${extension}`;
  return `${userId}/${year}/${month}/${uniqueFileName}`;
}

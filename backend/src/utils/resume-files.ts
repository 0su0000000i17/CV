import crypto from "node:crypto";
import path from "node:path";

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

export const allowedResumeMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
];

export function decodeFileName(fileName: string) {
  return Buffer.from(fileName, "latin1").toString("utf8");
}

function getFileExtension(fileName: string, mimeType: string) {
  const extensionFromName = path.extname(fileName).replace(".", "").toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/rtf":
    case "text/rtf":
      return "rtf";
    default:
      return "file";
  }
}

export function createResumeStorageFilePath(
  userId: string,
  fileName: string,
  mimeType: string
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = getFileExtension(fileName, mimeType);
  const uniqueFileName = `resume-${crypto.randomUUID()}.${extension}`;

  return `${userId}/${year}/${month}/${uniqueFileName}`;
}

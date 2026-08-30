import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sourceDocumentToEditableResume } from "../../resume-editor/source-document-to-editable.js";
import { extractPhotoFromPdf } from "../../resume-profile/extract-photo-from-pdf.js";
import {
  extractHhResume,
  UnsupportedHhResumeError,
} from "../../resume-processing/extract-hh-resume.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { saveProductEvent } from "../../utils/product-events.js";
import {
  allowedResumeMimeTypes,
  createResumeStorageFilePath,
  decodeFileName,
} from "../../utils/resume-files.js";
import { MAX_RESUMES_PER_USER } from "./constants.js";
import {
  createPhotoDataUrl,
  createSourceFileHash,
  removeStoredResumeFile,
} from "./file-storage.js";
import { countUserResumes, findDuplicateResume } from "./repository.js";
import {
  isResumeLimitError,
  sendDuplicateResumeError,
  sendResumeLimitError,
} from "./responses.js";
async function storeOriginalFile(userId: string, file: Express.Multer.File) {
  const filePath = createResumeStorageFilePath(userId, file.mimetype);
  const { error } = await supabaseAdmin.storage.from("resumes").upload(
    filePath,
    file.buffer,
    { contentType: file.mimetype, upsert: false }
  );
  if (error) throw error;
  return filePath;
}
async function parseResume(file: Express.Multer.File) {
  const [extraction, photo] = await Promise.all([
    extractHhResume({ fileBuffer: file.buffer, mimeType: file.mimetype }),
    extractPhotoFromPdf({ fileBuffer: file.buffer, mimeType: file.mimetype }),
  ]);
  const document = photo
    ? {
        ...extraction.document,
        photo: {
          contentType: photo.contentType,
          dataUrl: createPhotoDataUrl(photo.buffer, photo.contentType),
          displayWidth: photo.displayWidth,
          displayHeight: photo.displayHeight,
        },
      }
    : extraction.document;
  return { document, extraction, editable: sourceDocumentToEditableResume(document) };
}

export async function uploadResume(req: Request, res: Response) {
  let storedFilePath: string | null = null;
  try {
    const { user } = await getUserFromRequest(req);
    const file = req.file;
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!file) return sendError(res, 400, "Resume file is required");
    if (!allowedResumeMimeTypes.includes(file.mimetype)) {
      return sendError(res, 400, "Unsupported file type");
    }

    const sourceFileHash = createSourceFileHash(file.buffer);
    const duplicate = await findDuplicateResume({ userId: user.id, sourceFileHash });
    if (duplicate) return sendDuplicateResumeError(res, duplicate);
    if ((await countUserResumes(user.id)) >= MAX_RESUMES_PER_USER) {
      return sendResumeLimitError(res);
    }

    const decodedFileName = decodeFileName(file.originalname);
    storedFilePath = await storeOriginalFile(user.id, file);
    const parsed = await parseResume(file);
    const { data, error } = await supabaseAdmin.from("resumes").insert({
      user_id: user.id,
      title: parsed.editable.resumeJson.target.title || decodedFileName,
      role: parsed.editable.resumeJson.target.title,
      file_name: decodedFileName,
      file_path: storedFilePath,
      file_type: file.mimetype,
      file_size: file.size,
      source_file_hash: sourceFileHash,
      extracted_text: parsed.extraction.normalizedMarkdown,
      source_resume_document: parsed.document,
      editable_resume_json: parsed.editable.resumeJson,
      analysis_status: "idle",
    }).select().single();

    if (error) {
      await removeStoredResumeFile(storedFilePath);
      storedFilePath = null;
      if (isResumeLimitError(error)) return sendResumeLimitError(res);
      return sendServerError(res, "Failed to save parsed resume", error);
    }
    storedFilePath = null;
    await saveProductEvent({
      userId: user.id,
      name: "resume_uploaded",
      targetType: "resume",
      targetId: data.id,
    });
    return res.status(201).json({ resume: data });
  } catch (error) {
    await removeStoredResumeFile(storedFilePath);
    if (error instanceof UnsupportedHhResumeError) {
      return sendError(
        res,
        400,
        "Загрузите PDF-резюме, экспортированное с hh.ru или скачанное из Сервиса."
      );
    }
    return sendServerError(res, "Unexpected upload error", error);
  }
}

import type { Request, Response } from "express";

import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { buildProfileFromSourceResumeDocument } from "../resume-document/profile-compat.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { extractPhotoFromPdf } from "../resume-profile/extract-photo-from-pdf.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

type ExtractedPhotoResponse = {
  contentType: string;
  dataUrl: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
} | null;

function buildStoredStats(document: SourceResumeDocument, chars: number, photoFound = Boolean(document.photo?.dataUrl)) {
  return {
    rawChars: chars,
    normalizedChars: chars,
    photoFound,
    serviceLines: document.meta.serviceLines.length,
    experienceItems: document.experience.items.length,
    skillItems: document.skills.items.length,
  };
}

function isLikelyHhLogoPhoto(photo: NonNullable<ExtractedPhotoResponse>) {
  const width = Number(photo.displayWidth) || 0;
  const height = Number(photo.displayHeight) || 0;
  const isSmall = width > 0 && height > 0 && width <= 120 && height <= 120;
  const isSquare = width > 0 && height > 0 && Math.abs(width - height) <= 10;
  const isTinyImagePayload = photo.dataUrl.length < 18_000;

  return isSmall && isSquare && isTinyImagePayload;
}

function normalizeExtractedPhoto(photo: ExtractedPhotoResponse): ExtractedPhotoResponse {
  if (!photo) return null;
  return isLikelyHhLogoPhoto(photo) ? null : photo;
}

async function tryExtractStoredFilePhoto(resume: { file_path: string | null; file_type: string | null }): Promise<ExtractedPhotoResponse> {
  if (!resume.file_path) return null;

  try {
    const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    const photo = await extractPhotoFromPdf({ fileBuffer, mimeType: resume.file_type });
    const response = photo
      ? {
          contentType: photo.contentType,
          dataUrl: createPhotoDataUrl(photo.buffer, photo.contentType),
          displayWidth: photo.displayWidth,
          displayHeight: photo.displayHeight,
        }
      : null;

    return normalizeExtractedPhoto(response);
  } catch {
    return null;
  }
}

export async function extractResumeProfileController(req: Request, res: Response) {
  const { user } = await getUserFromRequest(req);
  const resumeId = getStringParam(req.params.resumeId);
  if (!user) return sendError(res, 401, "Unauthorized");
  if (!resumeId) return sendError(res, 400, "Invalid resume id");

  try {
    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    if (resume.source_resume_document && resume.extracted_text) {
      const document = resume.source_resume_document as SourceResumeDocument;
      const storedPhoto = normalizeExtractedPhoto(
        document.photo?.dataUrl
          ? {
              contentType: document.photo.contentType,
              dataUrl: document.photo.dataUrl,
              displayWidth: document.photo.displayWidth ?? null,
              displayHeight: document.photo.displayHeight ?? null,
            }
          : null
      );
      const filePhoto = storedPhoto ? null : await tryExtractStoredFilePhoto(resume);
      const photo = storedPhoto || filePhoto;

      return res.json({
        status: "completed",
        resumeId: resume.id,
        source: document.source,
        profile: buildProfileFromSourceResumeDocument(document),
        document,
        photo,
        stats: buildStoredStats(document, resume.extracted_text.length, Boolean(photo)),
      });
    }

    if (!resume.file_path) {
      return sendError(res, 404, "Resume source data is not available");
    }

    const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });
    const document = parseSourceResumeDocument(extraction.normalizedMarkdown);
    const rawPhoto = await extractPhotoFromPdf({ fileBuffer, mimeType: resume.file_type });
    const photo = normalizeExtractedPhoto(
      rawPhoto
        ? {
            contentType: rawPhoto.contentType,
            dataUrl: createPhotoDataUrl(rawPhoto.buffer, rawPhoto.contentType),
            displayWidth: rawPhoto.displayWidth,
            displayHeight: rawPhoto.displayHeight,
          }
        : null
    );

    return res.json({
      status: "completed",
      resumeId: resume.id,
      source: document.source,
      profile: buildProfileFromSourceResumeDocument(document),
      document,
      photo,
      stats: {
        rawChars: extraction.stats.rawChars,
        normalizedChars: extraction.stats.normalizedChars,
        photoFound: Boolean(photo),
        serviceLines: document.meta.serviceLines.length,
        experienceItems: document.experience.items.length,
        skillItems: document.skills.items.length,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to extract resume profile", error);
  }
}

function createPhotoDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

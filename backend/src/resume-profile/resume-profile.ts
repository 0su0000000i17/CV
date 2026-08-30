import type { Request, Response } from "express";

import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { buildProfileFromSourceResumeDocument } from "../resume-document/profile-compat.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { isCurrentSourceResumeDocument } from "../resume-document/version.js";
import { extractHhResume } from "../resume-processing/extract-hh-resume.js";
import { extractPhotoFromPdf } from "../resume-profile/extract-photo-from-pdf.js";
import {
  photoResponse,
  storedPhotoResponse,
  tryExtractStoredFilePhoto,
} from "./profile-photo.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

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

export async function extractResumeProfileController(req: Request, res: Response) {
  const { user } = await getUserFromRequest(req);
  const resumeId = getStringParam(req.params.resumeId);
  if (!user) return sendError(res, 401, "Unauthorized");
  if (!resumeId) return sendError(res, 400, "Invalid resume id");

  try {
    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const stored = isCurrentSourceResumeDocument(resume.source_resume_document)
      ? resume.source_resume_document
      : null;

    if (stored) {
      const document = stored;
      const storedPhoto = storedPhotoResponse(document.photo);
      const filePhoto = storedPhoto ? null : await tryExtractStoredFilePhoto(resume);
      const photo = storedPhoto || filePhoto;

      return res.json({
        status: "completed",
        resumeId: resume.id,
        source: document.source,
        profile: buildProfileFromSourceResumeDocument(document),
        document,
        photo,
        stats: buildStoredStats(document, resume.extracted_text?.length || 0, Boolean(photo)),
      });
    }

    if (resume.file_path) {
      const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
      const [extraction, rawPhoto] = await Promise.all([
        extractHhResume({ fileBuffer, mimeType: resume.file_type }),
        extractPhotoFromPdf({ fileBuffer, mimeType: resume.file_type }),
      ]);
      const document = extraction.document;
      const photo = photoResponse(rawPhoto);

      return res.json({
        status: "completed",
        resumeId: resume.id,
        source: document.source,
        profile: buildProfileFromSourceResumeDocument(document),
        document,
        photo,
        stats: {
          ...extraction.stats,
          photoFound: Boolean(photo),
          serviceLines: document.meta.serviceLines.length,
          skillItems: document.skills.items.length,
        },
      });
    }

    if (resume.extracted_text) {
      const parsed = parseSourceResumeDocument(resume.extracted_text);
      const legacyPhoto = (resume.source_resume_document as Partial<SourceResumeDocument> | null)?.photo;
      const document = legacyPhoto?.dataUrl ? { ...parsed, photo: legacyPhoto } : parsed;
      return res.json({
        status: "completed",
        resumeId: resume.id,
        source: document.source,
        profile: buildProfileFromSourceResumeDocument(document),
        document,
        photo: legacyPhoto || null,
        stats: buildStoredStats(document, resume.extracted_text.length, Boolean(legacyPhoto)),
      });
    }

    return sendError(res, 404, "Resume source data is not available");
  } catch (error) {
    return sendServerError(res, "Failed to extract resume profile", error);
  }
}

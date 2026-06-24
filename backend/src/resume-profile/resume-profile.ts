import type { Request, Response } from "express";

import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { extractPhotoFromPdf } from "../resume-profile/extract-photo-from-pdf.js";
import { extractResumeProfileFromText } from "../resume-profile/extract-profile-from-text.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function extractResumeProfileController(
  req: Request,
  res: Response
) {
  const { user } = await getUserFromRequest(req);
  const resumeId = getStringParam(req.params.resumeId);

  if (!user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (!resumeId) {
    return sendError(res, 400, "Invalid resume id");
  }

  try {
    const resume = await findResumeFileRecord({
      userId: user.id,
      resumeId,
    });

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const fileBuffer = await downloadResumeFileBuffer(resume.file_path);

    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    const profileExtraction = extractResumeProfileFromText(
      extraction.normalizedMarkdown
    );

    const photo = await extractPhotoFromPdf({
      fileBuffer,
      mimeType: resume.file_type,
    });

    return res.json({
      status: "completed",
      resumeId: resume.id,
      source: profileExtraction.source,
      profile: profileExtraction.profile,
      photo: photo
        ? {
            contentType: photo.contentType,
            dataUrl: createPhotoDataUrl(photo.buffer, photo.contentType),
          }
        : null,
      stats: {
        rawChars: extraction.stats.rawChars,
        normalizedChars: extraction.stats.normalizedChars,
        photoFound: Boolean(photo),
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to extract resume profile", error);
  }
}

function createPhotoDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
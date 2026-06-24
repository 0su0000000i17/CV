import type { Request, Response } from "express";

import { renderClassicResumePdf } from "../pdf/classic/render.js";
import { classicExportSchema } from "../pdf/classic/schema.js";
import { getResumeExportSource } from "../pdf/classic/source-text.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

function createFileName(sourceTitle: string) {
  const baseName = sourceTitle
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim();

  return encodeURIComponent(`${baseName || "resume"}.cvpro.pdf`);
}

export async function exportClassicResumeController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!resumeId) {
      return sendError(res, 400, "Invalid resume id");
    }

    const parsedBody = classicExportSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(res, 400, "Некорректные данные для сохранения резюме.");
    }

    const resume = await getResumeExportSource({
      userId: user.id,
      resumeId,
    });

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    if (!resume.sourceText.trim()) {
      return sendError(res, 400, "Не удалось извлечь текст исходного резюме.");
    }

    const sourceTitle =
      resume.file_name || resume.title || parsedBody.data.sourceTitle || "resume";

    const pdfBytes = await renderClassicResumePdf({
      ...parsedBody.data,
      sourceTitle,
      sourceText: resume.sourceText,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${createFileName(sourceTitle)}`
    );

    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    return sendServerError(res, "Failed to save adapted resume", error);
  }
}
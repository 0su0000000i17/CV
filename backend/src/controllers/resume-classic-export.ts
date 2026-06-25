import type { Request, Response } from "express";

import { buildClassicDocument } from "../resume-export/classic/document.js";
import { renderClassicResumePdf } from "../resume-export/classic/render-pdf.js";
import { classicExportSchema } from "../resume-export/classic/schema.js";
import { getResumeExportSource } from "../resume-export/classic/source.js";
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

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const parsedBody = classicExportSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(res, 400, "Некорректные данные для экспорта резюме.");
    }

    const source = await getResumeExportSource({
      userId: user.id,
      resumeId,
    });

    if (!source) return sendError(res, 404, "Resume not found");

    if (!source.sourceText.trim()) {
      return sendError(res, 400, "Не удалось извлечь текст исходного резюме.");
    }

    const sourceTitle =
      source.file_name || source.title || parsedBody.data.sourceTitle || "resume";

    const document = buildClassicDocument({
      sourceTitle,
      sourceText: source.sourceText,
      payload: parsedBody.data,
    });

    const pdfBytes = await renderClassicResumePdf(document);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${createFileName(sourceTitle)}`
    );

    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    return sendServerError(res, "Failed to export resume", error);
  }
}
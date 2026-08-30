import type { Request, Response } from "express";

import { applyEditableToSourceDocument } from "../../resume-editor/apply-editable-to-source-document.js";
import { isCurrentSourceResumeDocument } from "../../resume-document/version.js";
import { renderDraftMarkdown } from "../../resume-analysis/render-draft-markdown.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { findEditableResume, saveEditableResume } from "./repository.js";
import { updateResumeTextSchema } from "./schema.js";
import { applyContacts, applyPhoto } from "./source-updates.js";

export async function updateEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = updateResumeTextSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Некорректные данные редактора резюме.");
    const resume = await findEditableResume(user.id, resumeId);
    if (!resume) return sendError(res, 404, "Resume not found");
    const currentDocument = isCurrentSourceResumeDocument(resume.source_resume_document)
      ? applyEditableToSourceDocument(resume.source_resume_document, body.data.resumeJson)
      : resume.source_resume_document;
    const nextDocument = applyPhoto(
      applyContacts(currentDocument, body.data.contacts),
      body.data.photoUrl,
    );
    const renderedMarkdown = renderDraftMarkdown(body.data.resumeJson);
    const update: Record<string, unknown> = {
      editable_resume_json: body.data.resumeJson,
      analysis_status: "needs_update",
      last_score: null,
      updated_at: new Date().toISOString(),
    };
    if (renderedMarkdown) update.extracted_text = renderedMarkdown;
    if (isCurrentSourceResumeDocument(currentDocument)
      || body.data.photoUrl !== undefined || body.data.contacts !== undefined) {
      update.source_resume_document = nextDocument;
    }
    const saved = await saveEditableResume({ userId: user.id, resumeId, update });
    if (!saved) return sendError(res, 404, "Resume not found");
    return res.json({ status: "updated", resume: saved });
  } catch (error) {
    return sendServerError(res, "Unexpected resume text update error", error);
  }
}

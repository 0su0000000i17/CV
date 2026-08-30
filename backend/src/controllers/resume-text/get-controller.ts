import type { Request, Response } from "express";

import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { isCurrentSourceResumeDocument } from "../../resume-document/version.js";
import { createEditableResponse } from "./create-response.js";
import { extractOriginalResume, findEditableResume, persistParsedResume } from "./repository.js";

export async function getEditableResumeText(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const resume = await findEditableResume(user.id, resumeId);
    if (!resume) return sendError(res, 404, "Resume not found");
    const savedMarkdown = resume.extracted_text?.trim();
    if (savedMarkdown && isCurrentSourceResumeDocument(resume.source_resume_document)) {
      const source = resume.editable_resume_json ? "saved_json" : "saved_edit";
      return res.json(createEditableResponse({
        resume, markdown: savedMarkdown, source, stats: null,
      }));
    }
    if (resume.file_path) {
      const extraction = await extractOriginalResume(resume);
      const response = createEditableResponse({
        resume,
        markdown: extraction.normalizedMarkdown,
        source: "original_file",
        stats: extraction.stats,
        sourceDocument: extraction.document,
      });
      await persistParsedResume({
        userId: user.id,
        resumeId: resume.id,
        markdown: extraction.normalizedMarkdown,
        resumeJson: response.resumeJson,
        sourceDocument: response.document,
      });
      return res.json(response);
    }
    if (savedMarkdown) {
      return res.json(createEditableResponse({
        resume, markdown: savedMarkdown, source: "saved_edit", stats: null,
      }));
    }
    return sendError(res, 404, "Resume source data is not available");
  } catch (error) {
    return sendServerError(res, "Failed to get editable resume text", error);
  }
}

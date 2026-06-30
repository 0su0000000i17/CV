import type { Request, Response } from "express";

import { applySourceResumeStructure } from "../resume-adaptation/apply-source-resume-structure.js";
import { loadSourceResumeDocument } from "../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../resume-adaptation/resume-ai-payload.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { generateResumeImprovement } from "../resume-improvement/generate-resume-improvement.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

export async function improveResumeController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const result = await generateResumeImprovement({ resumeMarkdown: resumeJson });
    const improvement = applySourceResumeStructure({
      adaptation: result.improvement,
      sourceDocument: source.document,
    });

    await saveProductEvent({
      userId: user.id,
      name: "resume_improved",
      targetType: "resume",
      targetId: resume.id,
    });

    return res.json({
      status: "adapted",
      resumeId: resume.id,
      adaptation: improvement,
      meta: {
        resumeChars: result.meta.resumeChars,
        vacancyChars: 0,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to improve resume", error);
  }
}

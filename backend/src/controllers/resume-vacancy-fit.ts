import type { Request, Response } from "express";
import { z } from "zod";

import { checkResumeVacancyFit } from "../resume-adaptation/check-resume-vacancy-fit.js";
import { loadSourceResumeDocument } from "../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../resume-adaptation/resume-ai-payload.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

const schema = z.object({
  vacancy: z.object({ isVacancy: z.boolean() }).passthrough(),
  vacancyText: z.string().trim().max(40_000).optional(),
});

export async function checkResumeVacancyFitController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = schema.safeParse(req.body);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid vacancy data");

    const vacancy = body.data.vacancy as NormalizedVacancy;
    if (!vacancy.isVacancy) return sendError(res, 400, "Invalid vacancy");

    const vacancyText = body.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);
    if (!vacancyText) return sendError(res, 400, "Vacancy has not enough data");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const result = await checkResumeVacancyFit({ resumeJson, vacancy, vacancyText });

    await saveProductEvent({
      userId: user.id,
      name: "vacancy_fit_checked",
      targetType: "resume",
      targetId: resume.id,
    });

    return res.json({
      status: result.fit.canAdapt ? "fit_passed" : "fit_blocked",
      resumeId: resume.id,
      fit: result.fit,
      meta: {
        ...result.meta,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to check resume vacancy fit", error);
  }
}

import type { Request, Response } from "express";
import { z } from "zod";

import { applySourceResumeStructure } from "../resume-adaptation/apply-source-resume-structure.js";
import { generateResumeAdaptation } from "../resume-adaptation/generate-resume-adaptation.js";
import { loadSourceResumeDocument } from "../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../resume-adaptation/resume-ai-payload.js";
import type { ResumeVacancyFitResult } from "../resume-adaptation/types.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { createAiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

const settingsSchema = z.object({
  preserveAuthorStyle: z.boolean().optional(),
  strengthenAchievements: z.boolean().optional(),
  optimizeForAts: z.boolean().optional(),
  tailorSkillsToVacancy: z.boolean().optional(),
  makeTextMoreSpecific: z.boolean().optional(),
}).partial().optional();

const schema = z.object({
  vacancy: z.object({ isVacancy: z.boolean() }).passthrough(),
  vacancyText: z.string().trim().max(40_000).optional(),
  fit: z.object({ canAdapt: z.boolean(), adaptationMode: z.string() }).passthrough(),
  adaptationSettings: settingsSchema,
});

function normalizeSettings(value: z.infer<typeof settingsSchema>) {
  return {
    preserveAuthorStyle: value?.preserveAuthorStyle ?? true,
    strengthenAchievements: value?.strengthenAchievements ?? true,
    optimizeForAts: value?.optimizeForAts ?? true,
    tailorSkillsToVacancy: value?.tailorSkillsToVacancy ?? true,
    makeTextMoreSpecific: value?.makeTextMoreSpecific ?? true,
  };
}

export async function adaptResumeToVacancyController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = schema.safeParse(req.body);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid adaptation data");

    const vacancy = body.data.vacancy as NormalizedVacancy;
    const fit = body.data.fit as ResumeVacancyFitResult;

    if (!vacancy.isVacancy) return sendError(res, 400, "Invalid vacancy");
    if (!fit.canAdapt || fit.adaptationMode === "blocked") {
      return sendError(res, 409, "Adaptation blocked");
    }

    const vacancyText = body.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);
    if (!vacancyText) return sendError(res, 400, "Vacancy has not enough data");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const debugWriter = await createAiDebugArtifactWriter({
      kind: "resume-adaptation",
      resumeId: resume.id,
      extra: {
        vacancyInputChars: vacancyText.length,
        sourceMarkdownChars: source.markdown.length,
        sourceMarkdownLimited: source.markdownLimited,
      },
    });
    const result = await generateResumeAdaptation({
      resumeMarkdown: resumeJson,
      vacancy,
      vacancyText,
      fit,
      settings: normalizeSettings(body.data.adaptationSettings),
      debugWriter,
    });
    const adaptation = applySourceResumeStructure({
      adaptation: result.adaptation,
      sourceDocument: source.document,
    });
    await debugWriter?.writeJson("08-final-after-source-structure.json", adaptation);

    await saveProductEvent({
      userId: user.id,
      name: "resume_adapted",
      targetType: "resume",
      targetId: resume.id,
    });

    return res.json({
      status: "adapted",
      resumeId: resume.id,
      adaptation,
      meta: {
        ...result.meta,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
        debugArtifactDir: debugWriter?.artifactDir || null,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to adapt resume to vacancy", error);
  }
}

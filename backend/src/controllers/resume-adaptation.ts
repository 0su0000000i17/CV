import type { Request, Response } from "express";
import { z } from "zod";

import { generateResumeAdaptation } from "../resume-adaptation/generate-resume-adaptation.js";
import type { ResumeVacancyFitResult } from "../resume-adaptation/types.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

const nullableStringSchema = z.string().trim().min(1).nullable();

const normalizedVacancySchema = z.object({
  isVacancy: z.boolean(),
  rejectionReason: nullableStringSchema,
  title: nullableStringSchema,
  company: nullableStringSchema,
  location: nullableStringSchema,
  salary: nullableStringSchema,
  employment: nullableStringSchema,
  workFormat: nullableStringSchema,
  schedule: nullableStringSchema,
  seniority: nullableStringSchema,
  summary: nullableStringSchema,
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).nullable(),
});

const fitRiskFlagSchema = z.object({
  type: z.string(),
  severity: z.string(),
  explanation: z.string(),
});

const fitSchema = z.object({
  canAdapt: z.boolean(),
  fit: z.string(),
  score: z.number(),
  confidence: z.number(),
  resumeRole: nullableStringSchema,
  vacancyRole: nullableStringSchema,
  careerMove: z.string(),
  adaptationMode: z.string(),
  reason: z.string(),
  safeAdaptationDirection: nullableStringSchema,
  matchedRequirements: z.array(z.string()).default([]),
  transferableExperience: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  blockingGaps: z.array(z.string()).default([]),
  allowedChanges: z.array(z.string()).default([]),
  forbiddenChanges: z.array(z.string()).default([]),
  riskFlags: z.array(fitRiskFlagSchema).default([]),
});

const adaptationSettingsSchema = z
  .object({
    preserveAuthorStyle: z.boolean().optional(),
    strengthenAchievements: z.boolean().optional(),
    optimizeForAts: z.boolean().optional(),
    tailorSkillsToVacancy: z.boolean().optional(),
    makeTextMoreSpecific: z.boolean().optional(),
  })
  .optional()
  .transform((value) => ({
    preserveAuthorStyle: value?.preserveAuthorStyle ?? true,
    strengthenAchievements: value?.strengthenAchievements ?? true,
    optimizeForAts: value?.optimizeForAts ?? true,
    tailorSkillsToVacancy: value?.tailorSkillsToVacancy ?? true,
    makeTextMoreSpecific: value?.makeTextMoreSpecific ?? true,
  }));

const adaptResumeSchema = z.object({
  vacancy: normalizedVacancySchema,
  vacancyText: z.string().trim().max(40_000).optional(),
  fit: fitSchema,
  adaptationSettings: adaptationSettingsSchema,
});

export async function adaptResumeToVacancyController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const parsedBody = adaptResumeSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(
        res,
        400,
        "Некорректные данные для адаптации. Сначала проверьте вакансию и совместимость."
      );
    }

    const vacancy = parsedBody.data.vacancy as NormalizedVacancy;
    const fit = parsedBody.data.fit as ResumeVacancyFitResult;

    if (!vacancy.isVacancy) {
      return sendError(
        res,
        400,
        vacancy.rejectionReason ||
          "Сначала вставьте корректную ссылку или текст вакансии."
      );
    }

    if (!fit.canAdapt || fit.adaptationMode === "blocked") {
      return sendError(
        res,
        409,
        "Адаптация заблокирована: резюме не подходит вакансии без выдумывания опыта."
      );
    }

    const preparedVacancyText =
      parsedBody.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);

    if (!preparedVacancyText) {
      return sendError(
        res,
        400,
        "Вакансия распознана, но в ней недостаточно данных для адаптации."
      );
    }

    const resume = await findResumeFileRecord({
      userId: user.id,
      resumeId,
    });

    if (!resume) return sendError(res, 404, "Resume not found");

    let fileBuffer: Buffer;

    try {
      fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    } catch (downloadError) {
      return sendServerError(
        res,
        "Failed to download resume file for adaptation",
        downloadError
      );
    }

    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    const resumeMarkdown = resume.extracted_text?.trim() || extraction.markdown;

    const result = await generateResumeAdaptation({
      resumeMarkdown,
      vacancy,
      vacancyText: preparedVacancyText,
      fit,
      settings: parsedBody.data.adaptationSettings,
    });

    return res.json({
      status: "adapted",
      resumeId: resume.id,
      adaptation: result.adaptation,
      meta: {
        ...result.meta,
        markdownChars: resumeMarkdown.length,
        markdownLimited: !resume.extracted_text && extraction.stats.limited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to adapt resume to vacancy", error);
  }
}
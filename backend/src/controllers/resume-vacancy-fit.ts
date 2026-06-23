import type { Request, Response } from "express";
import { z } from "zod";

import { checkResumeVacancyFit } from "../resume-adaptation/check-resume-vacancy-fit.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import {
  findResumeFileRecord,
  setResumeAnalysisStatus,
} from "../resume-analysis/repositories/resumes-repository.js";
import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
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

const checkResumeVacancyFitSchema = z.object({
  vacancy: normalizedVacancySchema,
  vacancyText: z.string().trim().max(40_000).optional(),
});

export async function checkResumeVacancyFitController(
  req: Request,
  res: Response
) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!resumeId) {
      return sendError(res, 400, "Invalid resume id");
    }

    const parsedBody = checkResumeVacancyFitSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(
        res,
        400,
        "Некорректные данные вакансии. Сначала распознайте вакансию."
      );
    }

    const vacancy = parsedBody.data.vacancy as NormalizedVacancy;

    if (!vacancy.isVacancy) {
      return sendError(
        res,
        400,
        vacancy.rejectionReason ||
          "Сначала вставьте корректную ссылку или текст вакансии."
      );
    }

    const preparedVacancyText =
      parsedBody.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);

    if (!preparedVacancyText) {
      return sendError(
        res,
        400,
        "Вакансия распознана, но в ней недостаточно данных для проверки."
      );
    }

    const resume = await findResumeFileRecord({
      userId: user.id,
      resumeId,
    });

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    let fileBuffer: Buffer;

    try {
      fileBuffer = await downloadResumeFileBuffer(resume.file_path);
    } catch (downloadError) {
      return sendServerError(
        res,
        "Failed to download resume file for vacancy fit",
        downloadError
      );
    }

    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    const result = await checkResumeVacancyFit({
      resumeMarkdown: extraction.markdown,
      vacancy,
      vacancyText: preparedVacancyText,
    });

    return res.json({
      status: result.fit.canAdapt ? "fit_passed" : "fit_blocked",
      resumeId: resume.id,
      fit: result.fit,
      meta: {
        ...result.meta,
        markdownChars: extraction.stats.returnedChars,
        markdownLimited: extraction.stats.limited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to check resume vacancy fit", error);
  }
}
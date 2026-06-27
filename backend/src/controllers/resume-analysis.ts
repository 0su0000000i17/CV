import type { Request, Response } from "express";

import { analyzeResume } from "../ai/services/analyze-resume.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import {
  createAnalysisCacheKey,
  createResumeContentHashes,
  getExpectedAiSignature,
} from "../resume-analysis/hashing.js";
import {
  findResumeFileRecord,
  findResumeOwnerRecord,
  markResumeAnalysisCompleted,
  setResumeAnalysisStatus,
} from "../resume-analysis/repositories/resumes-repository.js";
import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import {
  createResumeAnalysisFromCache,
  findCurrentResumeReusableAnalysis,
  findLatestResumeAnalysis,
  saveFreshResumeAnalysis,
} from "../resume-analysis/repositories/resume-analyses-repository.js";
import {
  findUserReusableCache,
  upsertResumeAnalysisCache,
} from "../resume-analysis/repositories/resume-analysis-cache-repository.js";
import { getTargetRoleFromAnalysis, mapAnalysisRow } from "../resume-analysis/presenter.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

function createTextExtraction(markdown: string) {
  return {
    rawMarkdown: markdown,
    normalizedMarkdown: markdown,
    sanitizedMarkdown: markdown,
    markdown,
    stats: {
      rawChars: markdown.length,
      normalizedChars: markdown.length,
      sanitizedChars: markdown.length,
      returnedChars: markdown.length,
      maxChars: markdown.length,
      limited: false,
    },
  };
}

async function loadAnalysisSource(resume: Awaited<ReturnType<typeof findResumeFileRecord>>) {
  if (!resume) throw new Error("Resume not found");
  const savedMarkdown = resume.extracted_text?.trim();
  if (savedMarkdown) {
    return {
      fileBuffer: Buffer.from(savedMarkdown),
      extraction: createTextExtraction(savedMarkdown),
    };
  }
  if (!resume.file_path) throw new Error("Resume has no stored text or legacy file");
  const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });
  return { fileBuffer, extraction };
}

export async function getLatestResumeAnalysis(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findResumeOwnerRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const latestAnalysis = await findLatestResumeAnalysis({ userId: user.id, resumeId });
    if (!latestAnalysis) {
      return res.json({ resumeId, analysis: null, analysisRecord: null, meta: null });
    }

    return res.json(mapAnalysisRow(latestAnalysis));
  } catch (error) {
    return sendServerError(res, "Unexpected latest analysis fetch error", error);
  }
}

export async function analyzeResumePreview(req: Request, res: Response) {
  let currentUserId: string | null = null;
  let currentResumeId: string | null = null;

  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    currentUserId = user.id;
    currentResumeId = resumeId;

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    await setResumeAnalysisStatus({ userId: user.id, resumeId: resume.id, status: "analyzing" });

    const { fileBuffer, extraction } = await loadAnalysisSource(resume);
    const hashes = createResumeContentHashes(fileBuffer, extraction);
    const aiSignature = getExpectedAiSignature();
    const cacheKey = createAnalysisCacheKey({ userId: user.id, hashes, aiSignature });

    const currentResumeCachedAnalysis = await findCurrentResumeReusableAnalysis({
      userId: user.id,
      resumeId: resume.id,
      cacheKey,
    });

    if (currentResumeCachedAnalysis) {
      await markResumeAnalysisCompleted({
        userId: user.id,
        resumeId: resume.id,
        score: currentResumeCachedAnalysis.score,
        role: getTargetRoleFromAnalysis(currentResumeCachedAnalysis.analysis),
      });
      await saveProductEvent({
        userId: user.id,
        name: "resume_analyzed",
        targetType: "resume",
        targetId: resume.id,
      });
      return res.json(mapAnalysisRow(currentResumeCachedAnalysis, {
        cached: true,
        cacheReason: "same_resume_id_same_content",
      }));
    }

    const userReusableCache = await findUserReusableCache({ userId: user.id, cacheKey });
    if (userReusableCache) {
      const cachedAnalysisForCurrentResume = await createResumeAnalysisFromCache({
        userId: user.id,
        resumeId: resume.id,
        cache: userReusableCache,
      });
      await markResumeAnalysisCompleted({
        userId: user.id,
        resumeId: resume.id,
        score: cachedAnalysisForCurrentResume.score,
        role: getTargetRoleFromAnalysis(cachedAnalysisForCurrentResume.analysis),
      });
      await saveProductEvent({
        userId: user.id,
        name: "resume_analyzed",
        targetType: "resume",
        targetId: resume.id,
      });
      return res.json(mapAnalysisRow(cachedAnalysisForCurrentResume, {
        cached: true,
        cacheReason: "same_user_same_resume_content",
      }));
    }

    const aiResult = await analyzeResume({ resumeMarkdown: extraction.markdown });
    const savedAnalysis = await saveFreshResumeAnalysis({
      userId: user.id,
      resumeId: resume.id,
      aiResult,
      hashes,
      cacheKey,
      markdownChars: extraction.stats.returnedChars,
      markdownLimited: extraction.stats.limited,
    });

    await upsertResumeAnalysisCache({ userId: user.id, cacheKey, analysisRow: savedAnalysis });
    await markResumeAnalysisCompleted({
      userId: user.id,
      resumeId: resume.id,
      score: savedAnalysis.score,
      role: getTargetRoleFromAnalysis(savedAnalysis.analysis),
    });
    await saveProductEvent({
      userId: user.id,
      name: "resume_analyzed",
      targetType: "resume",
      targetId: resume.id,
    });
    return res.json(mapAnalysisRow(savedAnalysis, { cached: false }));
  } catch (error) {
    if (currentUserId && currentResumeId) {
      await setResumeAnalysisStatus({ userId: currentUserId, resumeId: currentResumeId, status: "failed" });
    }
    return sendServerError(res, "Failed to analyze resume", error);
  }
}

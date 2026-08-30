import { analyzeResume } from "../../ai/services/analyze-resume.js";
import {
  createAnalysisCacheKey,
  createResumeContentHashes,
  getExpectedAiSignature,
} from "../../resume-analysis/hashing.js";
import { getTargetRoleFromAnalysis, mapAnalysisRow } from "../../resume-analysis/presenter.js";
import { upsertResumeAnalysisCache } from "../../resume-analysis/repositories/resume-analysis-cache-repository.js";
import {
  findLatestResumeAnalysis,
  saveFreshResumeAnalysis,
} from "../../resume-analysis/repositories/resume-analyses-repository.js";
import {
  findResumeFileRecord,
  markResumeAnalysisCompleted,
  setResumeAnalysisStatus,
} from "../../resume-analysis/repositories/resumes-repository.js";
import { saveProductEvent } from "../../utils/product-events.js";
import { createPreviousAssessment } from "./previous-assessment.js";
import { loadAnalysisSource } from "./source-loader.js";

export async function buildAnalysisResult(params: { userId: string; resumeId: string }) {
  const resume = await findResumeFileRecord(params);
  if (!resume) throw new Error("Resume not found");
  const previous = await findLatestResumeAnalysis({
    userId: params.userId,
    resumeId: resume.id,
  });
  await setResumeAnalysisStatus({
    userId: params.userId,
    resumeId: resume.id,
    status: "analyzing",
  });
  const { fileBuffer, extraction } = await loadAnalysisSource(resume);
  const hashes = createResumeContentHashes(fileBuffer, extraction);
  const cacheKey = createAnalysisCacheKey({
    userId: params.userId,
    hashes,
    aiSignature: getExpectedAiSignature(),
  });
  const aiResult = await analyzeResume({
    resumeMarkdown: extraction.markdown,
    previousAssessment: createPreviousAssessment(previous, hashes),
  });
  const saved = await saveFreshResumeAnalysis({
    userId: params.userId,
    resumeId: resume.id,
    aiResult,
    hashes,
    cacheKey,
    markdownChars: extraction.stats.returnedChars,
    markdownLimited: extraction.stats.limited,
  });
  await upsertResumeAnalysisCache({ userId: params.userId, cacheKey, analysisRow: saved });
  await markResumeAnalysisCompleted({
    userId: params.userId,
    resumeId: resume.id,
    score: saved.score,
    role: getTargetRoleFromAnalysis(saved.analysis),
  });
  await saveProductEvent({
    userId: params.userId,
    name: "resume_analyzed",
    targetType: "resume",
    targetId: resume.id,
  });
  return mapAnalysisRow(saved, { cached: false });
}

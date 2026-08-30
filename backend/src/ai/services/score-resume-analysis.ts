import type { AiResumeAnalysis } from "../schemas/resume-analysis-schema.js";
import { normalizeResumeAnalysisPresentation } from "./resume-analysis-presentation.js";
import { applyCaps } from "./resume-profile-scoring/caps.js";
import { buildExperienceProfileDiagnostics } from "./resume-profile-scoring/experience-profile.js";
import {
  calculateSections,
  calculateWeightedScore,
} from "./resume-profile-scoring/sections.js";
import type {
  ScoreResumeAnalysisParams,
  ScoreResumeAnalysisResult,
} from "./resume-profile-scoring/types.js";

export function scoreResumeAnalysis(
  aiAnalysis: AiResumeAnalysis,
  params: ScoreResumeAnalysisParams = {}
): ScoreResumeAnalysisResult {
  const profileDiagnostics = buildExperienceProfileDiagnostics(params.resumeMarkdown);
  const sections = calculateSections(aiAnalysis, params);
  const baseScore = calculateWeightedScore(sections);
  const cappedScore = applyCaps(aiAnalysis, baseScore);

  const analysis = normalizeResumeAnalysisPresentation({
    score: cappedScore.score,
    summary: aiAnalysis.summary,
    targetRole: aiAnalysis.targetRole,
    targetLevel: aiAnalysis.targetLevel,
    recentRoles: aiAnalysis.recentRoles,
    strengths: aiAnalysis.strengths,
    weaknesses: aiAnalysis.weaknesses,
    atsIssues: aiAnalysis.atsIssues,
    recommendations: aiAnalysis.recommendations,
    missingKeywords: aiAnalysis.missingKeywords,
    suggestedHeadline: aiAnalysis.suggestedHeadline,
    redFlags: aiAnalysis.redFlags,
    sections,
  });

  return {
    analysis,
    scoring: {
      baseScore,
      finalScore: cappedScore.score,
      appliedCaps: cappedScore.appliedCaps,
      profile: profileDiagnostics,
    },
  };
}

import type { ResumeAnalysis } from "../schemas/resume-analysis-schema.js";
import {
  getAtsIssues,
  getRecommendations,
  getWeaknesses,
} from "./resume-analysis-presentation/derived-sections.js";
import { normalizeFlags } from "./resume-analysis-presentation/flags.js";
import { cleanList } from "./resume-analysis-presentation/list-utils.js";

export function normalizeResumeAnalysisPresentation(
  analysis: ResumeAnalysis
): ResumeAnalysis {
  const normalized = {
    ...analysis,
    redFlags: normalizeFlags(analysis.redFlags),
    strengths: cleanList(analysis.strengths),
    missingKeywords: cleanList(analysis.missingKeywords),
  };

  return {
    ...normalized,
    weaknesses: getWeaknesses(normalized),
    atsIssues: getAtsIssues(normalized),
    recommendations: getRecommendations(normalized),
  };
}

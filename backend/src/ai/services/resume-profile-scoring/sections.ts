import type {
  AiResumeAnalysis,
  ResumeAnalysis,
} from "../../schemas/resume-analysis-schema.js";
import { qualityScores, simpleQualityScores } from "./constants.js";
import { buildExperienceProfileDiagnostics } from "./experience-profile.js";
import type { ScoreResumeAnalysisParams } from "./types.js";
import { calculateCredibility, clampScore, hasFlag } from "./utils.js";

export function calculateSections(
  analysis: AiResumeAnalysis,
  params: ScoreResumeAnalysisParams = {}
): ResumeAnalysis["sections"] {
  let positioning = simpleQualityScores[analysis.positioningQuality];
  let roleFit = qualityScores[analysis.relevantExperience];
  let experience = qualityScores[analysis.relevantExperience];
  let evidence = simpleQualityScores[analysis.evidenceQuality];
  let scanability = simpleQualityScores[analysis.scanability];
  let ats = simpleQualityScores[analysis.atsCompatibility];
  let credibility = calculateCredibility(analysis.redFlags);
  const profileDiagnostics = buildExperienceProfileDiagnostics(params.resumeMarkdown);

  if (profileDiagnostics) {
    scanability = clampScore(scanability * 0.35 + profileDiagnostics.score * 0.65);
  }

  if (hasFlag(analysis, "role_mismatch")) {
    positioning = Math.min(positioning, 42);
    roleFit = Math.min(roleFit, 38);
    ats = Math.min(ats, 55);
    credibility = Math.min(credibility, 50);
  }

  if (hasFlag(analysis, "inflated_level")) {
    roleFit = Math.min(roleFit, 42);
    experience = Math.min(experience, 50);
    credibility = Math.min(credibility, 55);
  }

  if (hasFlag(analysis, "career_transition")) {
    roleFit = Math.min(roleFit, 52);
    experience = Math.min(experience, 55);
    positioning = Math.min(positioning, 60);
  }

  if (hasFlag(analysis, "weak_evidence")) {
    evidence = Math.min(evidence, 38);
    experience = Math.min(experience, 58);
    credibility = Math.min(credibility, 58);
  }

  if (hasFlag(analysis, "missing_metrics")) {
    evidence = Math.min(evidence, 40);
    experience = Math.min(experience, 62);
  }

  if (hasFlag(analysis, "generic_responsibilities")) {
    evidence = Math.min(evidence, 45);
    scanability = Math.min(scanability, 62);
  }

  if (hasFlag(analysis, "keyword_stuffing")) {
    ats = Math.min(ats, 55);
    credibility = Math.min(credibility, 58);
  }

  if (hasFlag(analysis, "poor_ats")) {
    ats = Math.min(ats, 40);
  }

  if (hasFlag(analysis, "unclear_positioning")) {
    positioning = Math.min(positioning, 42);
    scanability = Math.min(scanability, 52);
  }

  if (hasFlag(analysis, "low_scanability") || hasFlag(analysis, "overlong_resume")) {
    scanability = Math.min(scanability, 62);
    ats = Math.min(ats, 62);
  }

  return {
    positioning: clampScore(positioning),
    roleFit: clampScore(roleFit),
    experience: clampScore(experience),
    evidence: clampScore(evidence),
    scanability: clampScore(scanability),
    ats: clampScore(ats),
    credibility: clampScore(credibility),
  };
}

export function calculateWeightedScore(sections: ResumeAnalysis["sections"]) {
  return clampScore(
    sections.positioning * 0.14 +
      sections.roleFit * 0.2 +
      sections.experience * 0.18 +
      sections.evidence * 0.2 +
      sections.scanability * 0.1 +
      sections.ats * 0.1 +
      sections.credibility * 0.08
  );
}

import type {
  AiResumeAnalysis,
  ResumeAnalysis,
} from "../../schemas/resume-analysis-schema.js";
import { qualityScores, simpleQualityScores } from "./constants.js";
import { calculateMetricDensitySignal, calculateSkillsCoverageSignal } from "./content-signals.js";
import { buildExperienceProfileDiagnostics } from "./experience-profile.js";
import type { ScoreResumeAnalysisParams } from "./types.js";
import { calculateCredibility, clampScore, hasFlag } from "./utils.js";
import { flagCap } from "./section-caps.js";

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
    roleFit = clampScore(roleFit * 0.75 + profileDiagnostics.score * 0.25);
  }

  const metricDensitySignal = calculateMetricDensitySignal(params.resumeMarkdown);
  if (metricDensitySignal !== null) {
    evidence = clampScore(evidence * 0.55 + metricDensitySignal * 0.45);
  }

  const skillsCoverageSignal = calculateSkillsCoverageSignal(params.resumeMarkdown);
  if (skillsCoverageSignal !== null) {
    ats = clampScore(ats * 0.55 + skillsCoverageSignal * 0.45);
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

  evidence = Math.min(
    evidence,
    flagCap(analysis, "weak_evidence", { minor: 50, major: 38, critical: 30 }),
    flagCap(analysis, "missing_metrics", { minor: 52, major: 40, critical: 34 }),
    flagCap(analysis, "generic_responsibilities", { minor: 55, major: 45, critical: 38 })
  );
  experience = Math.min(
    experience,
    flagCap(analysis, "weak_evidence", { minor: 68, major: 58, critical: 50 }),
    flagCap(analysis, "missing_metrics", { minor: 70, major: 62, critical: 55 })
  );
  credibility = Math.min(
    credibility,
    flagCap(analysis, "weak_evidence", { minor: 68, major: 58, critical: 50 }),
    flagCap(analysis, "keyword_stuffing", { minor: 72, major: 58, critical: 48 })
  );
  scanability = Math.min(
    scanability,
    flagCap(analysis, "generic_responsibilities", { minor: 70, major: 62, critical: 55 }),
    flagCap(analysis, "unclear_positioning", { minor: 62, major: 52, critical: 45 }),
    flagCap(analysis, "low_scanability", { minor: 70, major: 62, critical: 52 }),
    flagCap(analysis, "overlong_resume", { minor: 70, major: 62, critical: 52 })
  );
  ats = Math.min(
    ats,
    flagCap(analysis, "keyword_stuffing", { minor: 65, major: 55, critical: 45 }),
    flagCap(analysis, "poor_ats", { minor: 55, major: 40, critical: 32 }),
    flagCap(analysis, "low_scanability", { minor: 70, major: 62, critical: 52 }),
    flagCap(analysis, "overlong_resume", { minor: 70, major: 62, critical: 52 })
  );
  positioning = Math.min(
    positioning,
    flagCap(analysis, "unclear_positioning", { minor: 52, major: 42, critical: 35 })
  );

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

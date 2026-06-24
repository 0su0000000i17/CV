import type {
  AiResumeAnalysis,
  RedFlagSeverity,
  ResumeAnalysis,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../schemas/resume-analysis-schema.js";
import { normalizeResumeAnalysisPresentation } from "./resume-analysis-presentation.js";

type ScoreResumeAnalysisResult = {
  analysis: ResumeAnalysis;
  scoring: {
    baseScore: number;
    finalScore: number;
    appliedCaps: string[];
  };
};

const qualityScores = {
  none: 10,
  weak: 30,
  partial: 55,
  solid: 75,
  strong: 90,
};

const simpleQualityScores = {
  poor: 30,
  medium: 65,
  good: 85,
};

const severityPenalty: Record<RedFlagSeverity, number> = {
  minor: 8,
  major: 18,
  critical: 32,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasFlag(analysis: AiResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

function hasSeverity(
  analysis: AiResumeAnalysis,
  type: ResumeRedFlagType,
  severity: RedFlagSeverity
) {
  return analysis.redFlags.some(
    (flag) => flag.type === type && flag.severity === severity
  );
}

function countSevereFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter(
    (flag) => flag.severity === "major" || flag.severity === "critical"
  ).length;
}

function countCriticalFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter((flag) => flag.severity === "critical").length;
}

function calculateCredibility(redFlags: ResumeRedFlag[]) {
  const penalty = redFlags.reduce(
    (sum, flag) => sum + severityPenalty[flag.severity],
    0
  );

  return clampScore(90 - penalty);
}

function calculateSections(analysis: AiResumeAnalysis): ResumeAnalysis["sections"] {
  let positioning = simpleQualityScores[analysis.positioningQuality];
  let roleFit = qualityScores[analysis.relevantExperience];
  let experience = qualityScores[analysis.relevantExperience];
  let evidence = simpleQualityScores[analysis.evidenceQuality];
  let scanability = simpleQualityScores[analysis.scanability];
  let ats = simpleQualityScores[analysis.atsCompatibility];
  let credibility = calculateCredibility(analysis.redFlags);

  if (hasFlag(analysis, "role_mismatch")) {
    positioning = Math.min(positioning, 45);
    roleFit = Math.min(roleFit, 40);
    ats = Math.min(ats, 60);
    credibility = Math.min(credibility, 55);
  }

  if (hasFlag(analysis, "inflated_level")) {
    roleFit = Math.min(roleFit, 45);
    experience = Math.min(experience, 55);
    credibility = Math.min(credibility, 60);
  }

  if (hasFlag(analysis, "career_transition")) {
    roleFit = Math.min(roleFit, 55);
    experience = Math.min(experience, 58);
    positioning = Math.min(positioning, 65);
  }

  if (hasFlag(analysis, "weak_evidence")) {
    evidence = Math.min(evidence, 45);
    experience = Math.min(experience, 65);
  }

  if (hasFlag(analysis, "generic_responsibilities")) {
    evidence = Math.min(evidence, 55);
  }

  if (hasFlag(analysis, "keyword_stuffing")) {
    ats = Math.min(ats, 60);
    credibility = Math.min(credibility, 65);
  }

  if (hasFlag(analysis, "poor_ats")) {
    ats = Math.min(ats, 45);
  }

  if (hasFlag(analysis, "unclear_positioning")) {
    positioning = Math.min(positioning, 45);
    scanability = Math.min(scanability, 55);
  }

  if (hasFlag(analysis, "low_scanability") || hasFlag(analysis, "overlong_resume")) {
    scanability = Math.min(scanability, 45);
    ats = Math.min(ats, 70);
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

function calculateWeightedScore(sections: ResumeAnalysis["sections"]) {
  return clampScore(
    sections.positioning * 0.15 +
      sections.roleFit * 0.2 +
      sections.experience * 0.2 +
      sections.evidence * 0.15 +
      sections.scanability * 0.1 +
      sections.ats * 0.1 +
      sections.credibility * 0.1
  );
}

function applyCaps(analysis: AiResumeAnalysis, score: number) {
  let finalScore = score;
  const appliedCaps: string[] = [];

  function cap(maxScore: number, reason: string) {
    if (finalScore > maxScore) {
      finalScore = maxScore;
      appliedCaps.push(`${reason}:${maxScore}`);
    }
  }

  const severeFlagsCount = countSevereFlags(analysis.redFlags);
  const criticalFlagsCount = countCriticalFlags(analysis.redFlags);

  if (hasFlag(analysis, "role_mismatch") && hasFlag(analysis, "inflated_level")) {
    cap(55, "role_mismatch_and_inflated_level");
  } else if (hasSeverity(analysis, "role_mismatch", "critical")) {
    cap(58, "critical_role_mismatch");
  } else if (hasFlag(analysis, "role_mismatch")) {
    cap(62, "role_mismatch");
  }

  if (hasSeverity(analysis, "inflated_level", "critical")) {
    cap(60, "critical_inflated_level");
  } else if (hasFlag(analysis, "inflated_level")) {
    cap(65, "inflated_level");
  }

  if (hasFlag(analysis, "career_transition")) {
    cap(65, "career_transition");
  }

  if (hasFlag(analysis, "keyword_stuffing") && hasFlag(analysis, "weak_evidence")) {
    cap(62, "keyword_stuffing_and_weak_evidence");
  }

  if (criticalFlagsCount >= 2) {
    cap(50, "two_or_more_critical_flags");
  }

  if (severeFlagsCount >= 4) {
    cap(52, "four_or_more_severe_flags");
  } else if (severeFlagsCount >= 3) {
    cap(58, "three_or_more_severe_flags");
  } else if (severeFlagsCount >= 2) {
    cap(68, "two_or_more_severe_flags");
  }

  if (
    ["middle", "senior", "lead"].includes(analysis.targetLevel) &&
    analysis.relevantExperience !== "solid" &&
    analysis.relevantExperience !== "strong"
  ) {
    cap(62, "middle_plus_without_solid_relevant_experience");
  }

  return {
    score: clampScore(finalScore),
    appliedCaps,
  };
}

export function scoreResumeAnalysis(
  aiAnalysis: AiResumeAnalysis
): ScoreResumeAnalysisResult {
  const sections = calculateSections(aiAnalysis);
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
    },
  };
}

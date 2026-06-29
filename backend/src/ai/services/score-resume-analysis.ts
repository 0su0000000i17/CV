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
  none: 8,
  weak: 25,
  partial: 48,
  solid: 70,
  strong: 88,
};

const simpleQualityScores = {
  poor: 22,
  medium: 55,
  good: 82,
};

const severityPenalty: Record<RedFlagSeverity, number> = {
  minor: 10,
  major: 22,
  critical: 38,
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

  return clampScore(88 - penalty);
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
    scanability = Math.min(scanability, 42);
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

function calculateWeightedScore(sections: ResumeAnalysis["sections"]) {
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
    cap(52, "role_mismatch_and_inflated_level");
  } else if (hasSeverity(analysis, "role_mismatch", "critical")) {
    cap(55, "critical_role_mismatch");
  } else if (hasFlag(analysis, "role_mismatch")) {
    cap(58, "role_mismatch");
  }

  if (hasSeverity(analysis, "inflated_level", "critical")) {
    cap(56, "critical_inflated_level");
  } else if (hasFlag(analysis, "inflated_level")) {
    cap(60, "inflated_level");
  }

  if (hasFlag(analysis, "career_transition")) {
    cap(60, "career_transition");
  }

  if (hasFlag(analysis, "keyword_stuffing") && hasFlag(analysis, "weak_evidence")) {
    cap(56, "keyword_stuffing_and_weak_evidence");
  }

  if (hasFlag(analysis, "weak_evidence") && hasFlag(analysis, "generic_responsibilities")) {
    cap(58, "weak_evidence_and_generic_responsibilities");
  }

  if (hasFlag(analysis, "missing_metrics") && hasFlag(analysis, "generic_responsibilities")) {
    cap(60, "missing_metrics_and_generic_responsibilities");
  } else if (hasFlag(analysis, "missing_metrics")) {
    cap(66, "missing_metrics");
  }

  if (analysis.evidenceQuality === "poor") {
    cap(62, "poor_evidence_quality");
  }

  if (criticalFlagsCount >= 2) {
    cap(48, "two_or_more_critical_flags");
  }

  if (severeFlagsCount >= 4) {
    cap(50, "four_or_more_severe_flags");
  } else if (severeFlagsCount >= 3) {
    cap(55, "three_or_more_severe_flags");
  } else if (severeFlagsCount >= 2) {
    cap(64, "two_or_more_severe_flags");
  }

  if (
    ["middle", "senior", "lead"].includes(analysis.targetLevel) &&
    analysis.relevantExperience !== "solid" &&
    analysis.relevantExperience !== "strong"
  ) {
    cap(58, "middle_plus_without_solid_relevant_experience");
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

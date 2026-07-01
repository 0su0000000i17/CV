import type { AiResumeAnalysis } from "../../schemas/resume-analysis-schema.js";
import {
  clampScore,
  countCriticalFlags,
  countSevereFlags,
  hasFlag,
  hasSeverity,
} from "./utils.js";

export function applyCaps(analysis: AiResumeAnalysis, score: number) {
  let finalScore = score;
  const appliedCaps: string[] = [];

  function cap(maxScore: number, reason: string) {
    if (finalScore > maxScore) {
      finalScore = maxScore;
      appliedCaps.push(`${reason}:${maxScore}`);
    }
  }

  applyRoleCaps(analysis, cap);
  applyEvidenceCaps(analysis, cap);
  applySeverityCaps(analysis, cap);

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

function applyRoleCaps(
  analysis: AiResumeAnalysis,
  cap: (maxScore: number, reason: string) => void
) {
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
}

function applyEvidenceCaps(
  analysis: AiResumeAnalysis,
  cap: (maxScore: number, reason: string) => void
) {
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
}

function applySeverityCaps(
  analysis: AiResumeAnalysis,
  cap: (maxScore: number, reason: string) => void
) {
  const severeFlagsCount = countSevereFlags(analysis.redFlags);
  const criticalFlagsCount = countCriticalFlags(analysis.redFlags);

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
}

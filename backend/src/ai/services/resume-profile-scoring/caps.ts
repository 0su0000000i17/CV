import type { AiResumeAnalysis } from "../../schemas/resume-analysis-schema.js";
import {
  clampScore,
  countCriticalFlags,
  countSevereFlags,
  hasFlag,
  hasSevereFlag,
  hasSeverity,
} from "./utils.js";

type RatioCap = (ratio: number, reason: string) => void;

export function applyCaps(analysis: AiResumeAnalysis, score: number) {
  let finalScore = score;
  const appliedCaps: string[] = [];

  // Caps are expressed as a ratio of the original (uncapped) score, not a
  // fixed absolute ceiling - otherwise any two resumes tripping the same
  // flag land on the exact same number regardless of how different their
  // actual content is, erasing the section-level sensitivity added in
  // sections.ts/content-signals.ts. Ratios use `score` (the original
  // parameter), never the shrinking `finalScore`, so caps don't compound.
  const ratioCap: RatioCap = (ratio, reason) => {
    const bounded = clampScore(Math.round(score * ratio));
    if (finalScore > bounded) {
      finalScore = bounded;
      appliedCaps.push(`${reason}:${bounded}`);
    }
  };

  applyRoleCaps(analysis, ratioCap);
  applyEvidenceCaps(analysis, ratioCap);
  applySeverityCaps(analysis, ratioCap);

  if (
    ["middle", "senior", "lead"].includes(analysis.targetLevel) &&
    analysis.relevantExperience !== "solid" &&
    analysis.relevantExperience !== "strong"
  ) {
    ratioCap(0.69, "middle_plus_without_solid_relevant_experience");
  }

  return {
    score: clampScore(finalScore),
    appliedCaps,
  };
}

function applyRoleCaps(analysis: AiResumeAnalysis, cap: RatioCap) {
  if (hasFlag(analysis, "role_mismatch") && hasFlag(analysis, "inflated_level")) {
    cap(0.62, "role_mismatch_and_inflated_level");
  } else if (hasSeverity(analysis, "role_mismatch", "critical")) {
    cap(0.65, "critical_role_mismatch");
  } else if (hasFlag(analysis, "role_mismatch")) {
    cap(0.69, "role_mismatch");
  }

  if (hasSeverity(analysis, "inflated_level", "critical")) {
    cap(0.67, "critical_inflated_level");
  } else if (hasFlag(analysis, "inflated_level")) {
    cap(0.71, "inflated_level");
  }

  if (hasFlag(analysis, "career_transition")) {
    cap(0.71, "career_transition");
  }
}

function applyEvidenceCaps(analysis: AiResumeAnalysis, cap: RatioCap) {
  // Combo caps require at least major severity on both sides: two advisory
  // minor notes are already priced into their section ceilings and must not
  // additionally slice the whole score - that's what froze improved resumes
  // at nearly the same number as their un-improved originals.
  if (hasSevereFlag(analysis, "keyword_stuffing") && hasSevereFlag(analysis, "weak_evidence")) {
    cap(0.67, "keyword_stuffing_and_weak_evidence");
  }

  if (
    hasSevereFlag(analysis, "weak_evidence") &&
    hasSevereFlag(analysis, "generic_responsibilities")
  ) {
    cap(0.69, "weak_evidence_and_generic_responsibilities");
  }

  if (
    hasSevereFlag(analysis, "missing_metrics") &&
    hasSevereFlag(analysis, "generic_responsibilities")
  ) {
    cap(0.71, "missing_metrics_and_generic_responsibilities");
  } else if (hasSevereFlag(analysis, "missing_metrics")) {
    cap(0.79, "missing_metrics");
  }

  if (analysis.evidenceQuality === "poor") {
    cap(0.74, "poor_evidence_quality");
  }
}

function applySeverityCaps(analysis: AiResumeAnalysis, cap: RatioCap) {
  // Only integrity-type flags stack into this blanket cut - presentation
  // flags (keyword_stuffing, poor_ats, low_scanability, overlong_resume,
  // unclear_positioning, inconsistent_titles) already have their own
  // specific section caps in sections.ts and their own credibility penalty;
  // letting them also count here would penalize the same style issue three
  // times over. See utils.ts for the full split.
  const severeFlagsCount = countSevereFlags(analysis.redFlags, true);
  const criticalFlagsCount = countCriticalFlags(analysis.redFlags, true);

  if (criticalFlagsCount >= 2) {
    cap(0.57, "two_or_more_critical_flags");
  }

  if (severeFlagsCount >= 4) {
    cap(0.6, "four_or_more_severe_flags");
  } else if (severeFlagsCount >= 3) {
    cap(0.65, "three_or_more_severe_flags");
  } else if (severeFlagsCount >= 2) {
    cap(0.76, "two_or_more_severe_flags");
  }
}

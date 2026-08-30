import type {
  AiResumeAnalysis,
  RedFlagSeverity,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../../schemas/resume-analysis-schema.js";
import { severityPenalty } from "./constants.js";

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function hasFlag(
  analysis: AiResumeAnalysis,
  type: ResumeRedFlagType
) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

export function hasSeverity(
  analysis: AiResumeAnalysis,
  type: ResumeRedFlagType,
  severity: RedFlagSeverity
) {
  return analysis.redFlags.some(
    (flag) => flag.type === type && flag.severity === severity
  );
}

// major or critical - i.e. the flag is a real finding, not an advisory note.
export function hasSevereFlag(analysis: AiResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some(
    (flag) => flag.type === type && (flag.severity === "major" || flag.severity === "critical")
  );
}

// Flags about whether the candidate actually fits/qualifies for the role
// (dishonesty risk, level mismatch, thin evidence). These are the flags that
// should be able to stack into the blanket "N+ severe flags" cut in
// caps.ts - each one alone is already a real red flag for a recruiter.
const INTEGRITY_FLAG_TYPES = new Set<ResumeRedFlagType>([
  "role_mismatch",
  "inflated_level",
  "weak_evidence",
  "missing_metrics",
  "generic_responsibilities",
  "career_transition",
]);

// Flags about how the resume is *presented* (formatting, keyword density,
// length, title wording). These are real, fixable issues and already pull
// down their own specific section (ats/scanability/positioning) via the
// per-flag caps in sections.ts, and pull down credibility via
// calculateCredibility below - but they say nothing about whether the
// candidate is actually qualified, so 2 of them shouldn't ALSO trigger the
// same blanket "N+ severe flags" global cut that integrity flags do; doing
// so triple-penalizes the same issue and can crater an otherwise strong
// resume's overall score over purely cosmetic problems.
export function countSevereFlags(redFlags: ResumeRedFlag[], onlyIntegrity = false) {
  return redFlags.filter(
    (flag) =>
      (flag.severity === "major" || flag.severity === "critical") &&
      (!onlyIntegrity || INTEGRITY_FLAG_TYPES.has(flag.type))
  ).length;
}

export function countCriticalFlags(redFlags: ResumeRedFlag[], onlyIntegrity = false) {
  return redFlags.filter(
    (flag) => flag.severity === "critical" && (!onlyIntegrity || INTEGRITY_FLAG_TYPES.has(flag.type))
  ).length;
}

// Presentation flags (formatting, keyword density, length) already cap their
// own sections in sections.ts; here they only get a light touch, because
// credibility answers "can a recruiter trust the facts in this resume", and a
// long paragraph or a dense tag list says nothing about honesty. Integrity
// flags keep the full severity penalty.
const presentationSeverityPenalty: Record<RedFlagSeverity, number> = {
  minor: 4,
  major: 9,
  critical: 16,
};

export function calculateCredibility(redFlags: ResumeRedFlag[]) {
  const penalty = redFlags.reduce(
    (sum, flag) =>
      sum +
      (INTEGRITY_FLAG_TYPES.has(flag.type)
        ? severityPenalty[flag.severity]
        : presentationSeverityPenalty[flag.severity]),
    0
  );

  return clampScore(88 - penalty);
}

export function countWords(value: string) {
  const matches = value.match(/[\p{L}\p{N}][\p{L}\p{N}_+.#-]*/gu);
  return matches?.length || 0;
}

export function countBullets(value: string) {
  // "•" and "—" are deliberately excluded: raw hh.ru PDF extraction prefixes
  // structural tags with them too ("• Банк", "— Программист, разработчик"),
  // which inflates the count on freshly-uploaded resumes relative to the
  // same resume after any edit/improve/adapt save (renderDraftMarkdown only
  // ever emits "-" for real bullets) - the mismatch made every "did the
  // content actually get shorter" comparison look like a regression even
  // when nothing was dropped.
  const matches = value.match(/^\s*(?:[-–]|\d+[.)])\s+\S/gm);
  return matches?.length || 0;
}

export function normalizeText(value: string) {
  return value.replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
}

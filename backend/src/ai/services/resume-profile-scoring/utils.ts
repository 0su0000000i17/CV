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

export function countSevereFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter(
    (flag) => flag.severity === "major" || flag.severity === "critical"
  ).length;
}

export function countCriticalFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter((flag) => flag.severity === "critical").length;
}

export function calculateCredibility(redFlags: ResumeRedFlag[]) {
  const penalty = redFlags.reduce(
    (sum, flag) => sum + severityPenalty[flag.severity],
    0
  );

  return clampScore(88 - penalty);
}

export function countWords(value: string) {
  const matches = value.match(/[\p{L}\p{N}][\p{L}\p{N}_+.#-]*/gu);
  return matches?.length || 0;
}

export function countBullets(value: string) {
  const matches = value.match(/^\s*(?:[-–—•*]|\d+[.)])\s+\S/gm);
  return matches?.length || 0;
}

export function normalizeText(value: string) {
  return value.replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
}

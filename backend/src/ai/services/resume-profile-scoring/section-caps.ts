import type {
  AiResumeAnalysis,
  ResumeRedFlagType,
} from "../../schemas/resume-analysis-schema.js";

export function flagCap(
  analysis: AiResumeAnalysis,
  type: ResumeRedFlagType,
  caps: { minor: number; major: number; critical: number }
) {
  const severities = analysis.redFlags
    .filter((flag) => flag.type === type)
    .map((flag) => flag.severity);
  if (!severities.length) return Number.POSITIVE_INFINITY;
  if (severities.includes("critical")) return caps.critical;
  if (severities.includes("major")) return caps.major;
  return caps.minor;
}

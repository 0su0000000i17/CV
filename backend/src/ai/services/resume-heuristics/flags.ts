import type {
  AiResumeAnalysis,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../../schemas/resume-analysis-schema.js";

export function addHeuristicFlag(
  analysis: AiResumeAnalysis,
  flags: ResumeRedFlag[],
  type: ResumeRedFlagType,
  severity: ResumeRedFlag["severity"],
  explanation: string
) {
  const alreadyExists = analysis.redFlags.some((flag) => flag.type === type) ||
    flags.some((flag) => flag.type === type);
  if (!alreadyExists) flags.push({ type, severity, explanation });
}

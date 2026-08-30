import type { ResumeAdaptationResult } from "../types.js";
import { findExperienceRewriteIssues } from "./narrative-quality/experience.js";
import { createNarrativeQualityRetryNotice } from "./narrative-quality/retry-notice.js";
import { findSummaryIssues } from "./narrative-quality/summary.js";
import { parseNarrativeSource } from "./narrative-quality/text.js";
import type { NarrativeQualityIssue } from "./narrative-quality/types.js";

export { createNarrativeQualityRetryNotice };
export type { NarrativeQualityIssue };

export function findNarrativeQualityIssues(
  resumeJson: string,
  adaptation: ResumeAdaptationResult
): NarrativeQualityIssue[] {
  const source = parseNarrativeSource(resumeJson);
  return [
    ...findSummaryIssues(source, adaptation),
    ...findExperienceRewriteIssues(source, adaptation),
  ];
}

export function getBlockingNarrativeIssues(issues: NarrativeQualityIssue[]) {
  return issues.filter((issue) => issue.severity === "blocking");
}

export function getAdvisoryNarrativeIssues(issues: NarrativeQualityIssue[]) {
  return issues.filter((issue) => issue.severity === "advisory");
}

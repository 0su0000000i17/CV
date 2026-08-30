import { getAdvisoryNarrativeIssues } from "../../resume-adaptation/adaptation-generation/narrative-quality-check.js";
import { repairConfirmedFactIntegrationIssues } from "../confirmed-fact-integration-check.js";
import { createSourcePreservingImprovementFallback } from "../source-preserving-fallback.js";
import type { ImprovementGenerationOutcome } from "./run.js";
import {
  inspectImprovementQuality,
  type ImprovementQualityContext,
} from "./quality/inspect.js";
import { blockingReasons, qualityScore } from "./quality/score.js";

export function finalizeImprovement(
  candidates: ImprovementGenerationOutcome[],
  context: ImprovementQualityContext,
) {
  const selected = candidates.map((outcome, index) => ({
    outcome,
    report: inspectImprovementQuality(outcome, context),
    index,
  })).sort((left, right) => qualityScore(left.report) - qualityScore(right.report)
    || left.index - right.index)[0];
  if (!selected) return null;
  let improvement = selected.outcome.improvement;
  let report = selected.report;
  if (report.integrationIssues.length) {
    improvement = repairConfirmedFactIntegrationIssues({
      resumeJson: context.resumeJson,
      adaptation: improvement,
      issues: report.integrationIssues,
    });
    report = inspectImprovementQuality({ ...selected.outcome, improvement }, context);
    const affected = new Set(selected.report.integrationIssues
      .map((issue) => issue.sourceIndex)).size;
    console.warn(`[improvement] Deterministic semantic repair reverted ${affected} affected experience item(s) to source bullets.`);
  }
  const blocking = blockingReasons(report);
  if (blocking.length) {
    console.warn(`[improvement] Deterministic quality control rejected every AI candidate; returning the source-preserving fallback. Reasons: ${blocking.join("; ")}`);
    improvement = createSourcePreservingImprovementFallback(context.resumeJson);
  } else {
    const advisory = getAdvisoryNarrativeIssues(report.narrativeIssues);
    if (advisory.length) {
      console.warn(
        "[improvement] Editorial advisories remain, but no blocking narrative violations were found; returning the result:",
        advisory.map((issue) => ({ location: issue.location, reason: issue.reason })),
      );
    }
    if (report.droppedSummaryMetrics.length) {
      console.warn("[improvement] Summary evidence advisory remains:", report.droppedSummaryMetrics);
    }
  }
  return { improvement, generationResult: selected.outcome.generationResult };
}

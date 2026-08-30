import type { ImprovementQualityReport } from "./inspect.js";

export function qualityScore(report: ImprovementQualityReport) {
  return report.blockingNarrativeIssues.length * 1_000
    + report.integrationIssues.length * 900
    + (report.dumpedConfirmedFacts.length + report.misroutedCompanyFacts.length) * 850
    + (report.droppedMetrics.length + report.firstPersonLeaks.length) * 800
    + report.droppedSummaryMetrics.length * 500
    + (report.shrink ? 250 : 0)
    + report.narrativeIssues.length * 25;
}

export function blockingReasons(report: ImprovementQualityReport) {
  return [
    ...report.blockingNarrativeIssues.map((issue) => `${issue.location}: ${issue.reason}`),
    ...report.droppedMetrics.map((issue) =>
      `sourceIndex ${issue.sourceIndex}: dropped metrics ${issue.tokens.join(", ")}`),
    ...report.firstPersonLeaks.map((issue) =>
      `${issue.field}: first-person leak (${issue.word})`),
    ...report.dumpedConfirmedFacts.map((issue) =>
      `${issue.location}: confirmed fact dumped as a separate answer`),
    ...report.misroutedCompanyFacts.map((issue) =>
      `sourceIndex ${issue.sourceIndex}: confirmed fact routed away from ${issue.company}`),
    ...report.integrationIssues.map((issue) =>
      `sourceIndex ${issue.sourceIndex}: ${issue.reason}`),
  ];
}

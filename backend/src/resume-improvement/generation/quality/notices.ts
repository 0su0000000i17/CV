import { createConfirmedFactsPlacementRetryNotice, createMisroutedCompanyFactsRetryNotice } from "../../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import { createNarrativeQualityRetryNotice } from "../../../resume-adaptation/adaptation-generation/narrative-quality-check.js";
import { createVolumeRetryNotice } from "../../../resume-adaptation/adaptation-generation/volume-preservation-check.js";
import { createConfirmedFactIntegrationRetryNotice } from "../../confirmed-fact-integration-check.js";
import { createFirstPersonRetryNotice } from "../../first-person-check.js";
import { createMetricPreservationRetryNotice } from "../../metric-preservation-check.js";
import { createSummaryMetricRetryNotice } from "../../summary-metric-preservation-check.js";
import type { ImprovementQualityReport } from "./inspect.js";

export function createQualityRetryNotices(report: ImprovementQualityReport) {
  return [
    report.droppedMetrics.length
      ? createMetricPreservationRetryNotice(report.droppedMetrics) : null,
    report.droppedSummaryMetrics.length
      ? createSummaryMetricRetryNotice(report.droppedSummaryMetrics) : null,
    report.firstPersonLeaks.length
      ? createFirstPersonRetryNotice(report.firstPersonLeaks) : null,
    report.shrink ? createVolumeRetryNotice(report.shrink) : null,
    report.narrativeIssues.length
      ? createNarrativeQualityRetryNotice(report.narrativeIssues) : null,
    report.dumpedConfirmedFacts.length
      ? createConfirmedFactsPlacementRetryNotice(report.dumpedConfirmedFacts) : null,
    report.misroutedCompanyFacts.length
      ? createMisroutedCompanyFactsRetryNotice(report.misroutedCompanyFacts) : null,
    report.integrationIssues.length
      ? createConfirmedFactIntegrationRetryNotice(report.integrationIssues) : null,
  ].filter((notice): notice is string => Boolean(notice));
}

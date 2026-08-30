import {
  findDumpedConfirmedFacts,
  findMisroutedCompanyFacts,
} from "../../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import {
  findNarrativeQualityIssues,
  getBlockingNarrativeIssues,
} from "../../../resume-adaptation/adaptation-generation/narrative-quality-check.js";
import { findVolumeShrink } from "../../../resume-adaptation/adaptation-generation/volume-preservation-check.js";
import { findConfirmedFactIntegrationIssues } from "../../confirmed-fact-integration-check.js";
import { findFirstPersonLeaks } from "../../first-person-check.js";
import { findDroppedMetrics } from "../../metric-preservation-check.js";
import { findDroppedSummaryMetrics } from "../../summary-metric-preservation-check.js";
import type { ImprovementGenerationOutcome } from "../run.js";

export type ImprovementQualityContext = {
  resumeJson: string;
  confirmedFacts?: string[];
  companies: ReturnType<
    typeof import("../../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js")["parseExperienceCompanies"]
  >;
};

export function inspectImprovementQuality(
  outcome: ImprovementGenerationOutcome,
  context: ImprovementQualityContext,
) {
  const narrativeIssues = findNarrativeQualityIssues(
    context.resumeJson,
    outcome.improvement,
  );
  return {
    droppedMetrics: findDroppedMetrics(context.resumeJson, outcome.improvement),
    droppedSummaryMetrics: findDroppedSummaryMetrics(context.resumeJson, outcome.improvement),
    firstPersonLeaks: findFirstPersonLeaks(outcome.improvement),
    shrink: findVolumeShrink(context.resumeJson, outcome.improvement),
    narrativeIssues,
    blockingNarrativeIssues: getBlockingNarrativeIssues(narrativeIssues),
    dumpedConfirmedFacts: findDumpedConfirmedFacts(
      context.confirmedFacts,
      outcome.improvement,
    ),
    misroutedCompanyFacts: findMisroutedCompanyFacts(
      context.confirmedFacts,
      outcome.improvement,
      context.companies,
    ),
    integrationIssues: findConfirmedFactIntegrationIssues({
      resumeJson: context.resumeJson,
      confirmedFacts: context.confirmedFacts,
      adaptation: outcome.improvement,
    }),
  };
}

export type ImprovementQualityReport = ReturnType<typeof inspectImprovementQuality>;

export function hasQualityIssues(report: ImprovementQualityReport) {
  return Boolean(report.droppedMetrics.length || report.droppedSummaryMetrics.length
    || report.firstPersonLeaks.length || report.shrink || report.narrativeIssues.length
    || report.dumpedConfirmedFacts.length || report.misroutedCompanyFacts.length
    || report.integrationIssues.length);
}

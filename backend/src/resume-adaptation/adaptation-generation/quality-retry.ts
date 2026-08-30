import {
  createConfirmedFactsPlacementRetryNotice,
  createMisroutedCompanyFactsRetryNotice,
  findDumpedConfirmedFacts,
  findMisroutedCompanyFacts,
  parseExperienceCompanies,
} from "./confirmed-facts-placement-check.js";
import {
  createConfirmedRequirementRetryNotice,
  findConfirmedRequirementsInNotAdded,
} from "./confirmed-requirement-check.js";
import {
  createNarrativeQualityRetryNotice,
  findNarrativeQualityIssues,
} from "./narrative-quality-check.js";
import type { ResumeAdaptationResult } from "../types.js";
import { createVolumeRetryNotice, findVolumeShrink } from "./volume-preservation-check.js";

export function inspectAdaptationRetryQuality(params: {
  resumeJson: string;
  adaptation: ResumeAdaptationResult;
  confirmedFacts?: string[];
  confirmedRequirements?: string[];
}) {
  const shrink = findVolumeShrink(params.resumeJson, params.adaptation);
  const narrative = findNarrativeQualityIssues(params.resumeJson, params.adaptation);
  const dropped = findConfirmedRequirementsInNotAdded(
    params.confirmedRequirements || [],
    params.adaptation
  );
  const dumped = findDumpedConfirmedFacts(params.confirmedFacts, params.adaptation);
  const misrouted = findMisroutedCompanyFacts(
    params.confirmedFacts,
    params.adaptation,
    parseExperienceCompanies(params.resumeJson)
  );
  const notices = [
    shrink ? createVolumeRetryNotice(shrink) : null,
    narrative.length ? createNarrativeQualityRetryNotice(narrative) : null,
    dropped.length ? createConfirmedRequirementRetryNotice(dropped) : null,
    dumped.length ? createConfirmedFactsPlacementRetryNotice(dumped) : null,
    misrouted.length ? createMisroutedCompanyFactsRetryNotice(misrouted) : null,
  ].filter((notice): notice is string => Boolean(notice));
  return {
    notice: notices.length ? notices.join("\n\n") : null,
    summary:
      `volume shrink: ${Boolean(shrink)}, narrative issues: ${narrative.length}, ` +
      `confirmed requirements dropped: ${dropped.length}, dumped confirmed facts: ${dumped.length}, ` +
      `misrouted company facts: ${misrouted.length}`,
  };
}

import { parseConfirmedFact } from "../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";
import { collectFactMatches } from "./collect-matches.js";
import { appendMultipleFactIssues } from "./multiple-facts.js";
import { parseSourceExperience } from "./source-experience.js";
import type { ConfirmedFactIntegrationIssue } from "./types.js";

export function findConfirmedFactIntegrationIssues(params: {
  resumeJson: string;
  confirmedFacts?: string[];
  adaptation: ResumeAdaptationResult;
}): ConfirmedFactIntegrationIssue[] {
  if (!params.confirmedFacts?.length) return [];
  const sourceItems = parseSourceExperience(params.resumeJson);
  const sourceByIndex = new Map(sourceItems.map((item) => [item.sourceIndex, item]));
  const adaptedByIndex = new Map(
    params.adaptation.adaptedResume.experience.map((item) => [item.sourceIndex, item])
  );
  const facts = params.confirmedFacts
    .map(parseConfirmedFact)
    .filter((fact) =>
      !fact.refusal && fact.kind === "experience" && fact.integration === "atomic"
    );
  const collected = collectFactMatches({ facts, sourceByIndex, adaptedByIndex });
  appendMultipleFactIssues(collected);
  return collected.issues.slice(0, 12);
}

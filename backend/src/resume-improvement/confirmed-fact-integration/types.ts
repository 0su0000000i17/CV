import type { ParsedConfirmedFact } from "../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";

export type SourceExperienceItem = {
  sourceIndex: number;
  company: string | null;
  bullets: string[];
};

export type ConfirmedFactIntegrationIssue = {
  type: "unrelated_merge" | "multiple_unrelated_facts";
  sourceIndex: number;
  company: string | null;
  bullet: string;
  facts: string[];
  reason: string;
};

export type FactMatch = {
  fact: ParsedConfirmedFact;
  sourceIndex: number;
  company: string | null;
  bullet: string;
  answerEvidence: boolean;
};

import type { ResumeAdaptationResult } from "../types.js";

export type ExperienceItem =
  ResumeAdaptationResult["adaptedResume"]["experience"][number];
export type CandidateGender = "female" | "male" | "unknown";

export type SupportContext = {
  sourceTextKey: string;
  originalSkills: string[];
  sourceUrls: string[];
  gender: CandidateGender;
  unsupportedClaims: string[];
  sourceMetricTokens: Set<string>;
};

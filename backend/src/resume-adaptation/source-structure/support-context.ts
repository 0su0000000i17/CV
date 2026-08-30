import { extractMetricTokens } from "../../utils/metric-text.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import type { ResumeAdaptationResult } from "../types.js";
import { detectCandidateGender } from "./gender-inflection.js";
import { createOriginalSkillPhrases } from "./skill-merge.js";
import {
  collectSourceUrls,
  collectText,
  createUnsupportedClaims,
} from "./support-evidence.js";
import { textKey } from "./text-core.js";
import type { SupportContext } from "./types.js";

export function createSupportContext(
  original: ResumeAdaptationResult,
  adapted: ResumeAdaptationResult,
  source: SourceResumeDocument,
  confirmedFacts: string[] = [],
): SupportContext {
  const confirmed = confirmedFacts
    .filter((fact) => !/^\[ОТКАЗ(?=[:\]])/iu.test(fact.trim()))
    .join("\n");
  const sourceText = [collectText(original).join("\n"), confirmed]
    .filter(Boolean)
    .join("\n");
  return {
    sourceTextKey: textKey(sourceText),
    originalSkills: createOriginalSkillPhrases(original.adaptedResume.skills),
    sourceUrls: collectSourceUrls(source, original),
    gender: detectCandidateGender(source),
    unsupportedClaims: createUnsupportedClaims(adapted),
    sourceMetricTokens: new Set(extractMetricTokens(sourceText)),
  };
}

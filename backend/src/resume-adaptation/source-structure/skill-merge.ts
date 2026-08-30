import {
  dedupeSkillNames,
  getSkillDedupeKey,
} from "../skills-canonicalization.js";
import type { AdaptedResumeSkills } from "../types.js";
import { isDanglingClaimText, isSupportedClaim } from "./claim-support.js";
import { normalizeNotAdded, normalizeSkillText } from "./resume-text.js";
import { clean, isSimilar, textKey, unique } from "./text-core.js";
import type { SupportContext } from "./types.js";

function splitSkillLine(value: string) {
  return clean(value)
    .split(/[|,;•]+/gu)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !/русский|родной/iu.test(item));
}

export function createOriginalSkillPhrases(original: AdaptedResumeSkills) {
  return unique([...original.primary, ...original.secondary].flatMap(splitSkillLine));
}

function findSupportedSkill(value: string, context: SupportContext) {
  const normalized = normalizeSkillText(value, context);
  if (!normalized || isDanglingClaimText(normalized)) return null;
  const valueKey = textKey(normalized);
  const exact = context.originalSkills.find((skill) => textKey(skill) === valueKey);
  if (exact || isSupportedClaim(normalized, context)) return normalized;
  return context.originalSkills.some((skill) => isSimilar(skill, normalized))
    ? normalized
    : null;
}

export function mergeSkills(
  original: AdaptedResumeSkills,
  adapted: AdaptedResumeSkills,
  context: SupportContext,
) {
  const addSupported = (items: string[]) => unique(items)
    .map((item) => findSupportedSkill(item, context))
    .filter((item): item is string => Boolean(item));
  const generated = dedupeSkillNames(addSupported([
    ...adapted.primary,
    ...adapted.secondary,
  ]));
  const preferred = generated.length
    ? generated
    : dedupeSkillNames(createOriginalSkillPhrases(original));
  const preferredKeys = new Set(preferred.map(getSkillDedupeKey));
  const combined = dedupeSkillNames([...preferred, ...context.originalSkills]);
  const primary = combined.filter((skill) => preferredKeys.has(getSkillDedupeKey(skill)));
  const used = new Set(primary.map(getSkillDedupeKey));
  return {
    primary,
    secondary: combined.filter((skill) => !used.has(getSkillDedupeKey(skill))),
    deprioritized: unique(adapted.deprioritized).filter((item) =>
      Boolean(findSupportedSkill(item, context)),
    ),
    notAdded: normalizeNotAdded(adapted.notAdded),
  };
}

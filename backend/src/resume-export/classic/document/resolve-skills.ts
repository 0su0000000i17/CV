import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicExportPayload, SourceSnapshot } from "../types.js";
import { cleanText, uniqueStrings } from "../text.js";
import { splitSkillValue } from "./skill-candidate-split.js";
import {
  isValidSkillValue,
  skillKey,
  splitExplicitSkillValue,
} from "./skill-classification.js";
import { removeBadSkillFragments } from "./skill-fragments.js";
import {
  collectLanguageKeys,
  collectLanguageLines,
  isKnownLanguageSkill,
  removeKnownLanguageFragments,
} from "./skill-language-filter.js";
import { splitPackedSkillLine } from "./skill-tokenizer.js";

function normalizeCandidates(values: string[]) {
  return uniqueStrings(values.flatMap(splitExplicitSkillValue).flatMap(splitPackedSkillLine))
    .map(cleanText)
    .filter(isValidSkillValue);
}

function sourceSkills(document: SourceResumeDocument | null) {
  return document ? document.skills.items.map(cleanText).filter(isValidSkillValue) : [];
}

export function resolveSkills(params: {
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  const skills = params.payload.adaptation.adaptedResume.skills;
  const adaptedRaw = [...skills.primary, ...skills.secondary, ...skills.deprioritized]
    .map(cleanText).filter(isValidSkillValue);
  const sourceRaw = sourceSkills(params.sourceDocument);
  const candidates = uniqueStrings([
    ...normalizeCandidates(sourceRaw),
    ...normalizeCandidates(adaptedRaw),
  ]);
  const source = sourceRaw.flatMap((item) => splitSkillValue(item, candidates));
  const adapted = adaptedRaw.flatMap((item) => splitSkillValue(item, candidates));
  const languageLines = collectLanguageLines(params.sourceDocument, params.snapshot);
  const { partKeys, phraseKeys } = collectLanguageKeys(languageLines, params.sourceDocument);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of [...adapted, ...source]) {
    const value = removeKnownLanguageFragments(item, languageLines);
    const key = skillKey(value);
    if (!isValidSkillValue(value) || !key || seen.has(key) ||
      isKnownLanguageSkill(value, languageLines, partKeys, phraseKeys)) continue;
    seen.add(key);
    result.push(value);
  }
  return removeBadSkillFragments(result);
}

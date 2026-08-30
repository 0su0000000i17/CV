import { cleanText, uniqueStrings } from "../text.js";
import {
  escapeRegExp,
  isValidSkillValue,
  skillKey,
} from "./skill-classification.js";

function isSingleWordFragment(value: string, allSkills: string[]) {
  const text = cleanText(value);
  if (!text || /\s/u.test(text) || /[A-Za-z0-9+#.]/u.test(text)) return false;
  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(text)}(?:$|\\s)`, "iu");
  return allSkills.some((item) => {
    const other = cleanText(item);
    return skillKey(other) !== skillKey(text) &&
      other.split(/\s+/u).length >= 3 && pattern.test(other);
  });
}

function hasVersionedAlternative(value: string, allSkills: string[]) {
  const text = cleanText(value);
  if (!/^[A-Za-z][A-Za-z0-9+#.]*$/u.test(text)) return false;
  const pattern = new RegExp(`^${escapeRegExp(text)}\\s+\\d+(?:\\.\\d+)?$`, "iu");
  return allSkills.some((item) => pattern.test(cleanText(item)));
}

function shouldDropPackedSkill(value: string, allSkills: string[]) {
  const parts = cleanText(value).split(/\s+/u).filter(Boolean);
  if (parts.length < 2) return false;
  const key = skillKey(value);
  const otherKeys = new Set(allSkills
    .filter((item) => skillKey(item) !== key)
    .map(skillKey)
    .filter(Boolean));
  return parts.every((part) => otherKeys.has(skillKey(part)));
}

export function removeBadSkillFragments(values: string[]) {
  const cleanValues = uniqueStrings(values.map(cleanText).filter(isValidSkillValue));
  return cleanValues.filter((item) =>
    !isSingleWordFragment(item, cleanValues) &&
    !hasVersionedAlternative(item, cleanValues) &&
    !shouldDropPackedSkill(item, cleanValues),
  );
}

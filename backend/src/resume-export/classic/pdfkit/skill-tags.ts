import { clean, textKey } from "./helpers.js";

export function splitPdfSkillTags(value: string) {
  return clean(value)
    .split(/[\n,;|•]+/u)
    .map(clean)
    .filter(Boolean);
}

export function removeCompoundSkillFragments(values: string[]) {
  const compoundParts = new Set(
    values
      .filter((value) => value.includes("/"))
      .flatMap((value) => value.split("/"))
      .map(textKey)
      .filter(Boolean),
  );

  return values.filter((value) => {
    if (value.includes("/")) return true;
    return !compoundParts.has(textKey(value));
  });
}

import { clean, isSimilar, textKey, textTokens } from "./text-core.js";
import type { SupportContext } from "./types.js";

export function isSupportedClaim(value: string, context: SupportContext) {
  const itemKey = textKey(value);
  if (!itemKey) return false;
  if (context.sourceTextKey.includes(itemKey)) return true;
  const valueTokens = textTokens(value);
  const supported = valueTokens.filter((token) =>
    context.sourceTextKey.includes(token),
  ).length;
  if (valueTokens.length > 0 && supported / valueTokens.length >= 0.65) return true;
  return context.originalSkills.some(
    (skill) => textKey(skill) === itemKey || isSimilar(skill, value),
  );
}

export function isDanglingClaimText(value: string) {
  const text = clean(value).replace(/[.,;:]+$/u, "");
  return (
    !text ||
    /^(?:работа|навык|навыки|опыт|владение|знание)$/iu.test(text) ||
    /^(?:работа|навык|навыки|опыт|владение|знание)\s+(?:в|с|со|на|для)$/iu.test(text) ||
    /^(?:создание|разработка|ведение|подготовка|монтаж)\s*$/iu.test(text)
  );
}

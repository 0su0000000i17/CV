import {
  clean,
  isNearDuplicate,
  similarity,
  textKey,
  textTokens,
} from "./text-core.js";

function stripEffectClause(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(
      /\b(?:что|котор(?:ый|ая|ое|ые)|позвол(?:ило|ила|яет|ял[ао]?|или)|обеспеч(?:ило|ила|ивает|ивал[ао]?|ивали)|способств(?:овало|овала|ует|овали))\b.*$/iu,
      "",
    )
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function coreFactText(value: string) {
  return stripEffectClause(value)
    .replace(
      /^(?:анализ(?:ировала|ировал)?|формир(?:овала|овал|ование)|созда(?:вала|вал|ние)|разрабатыва(?:ла|л|ние)|вела|вел|ведение|подготовка|подготавливала|производство|производила|координация|координировала|оформление|оформляла|верстка|верстала|коммуникация|коммуницировала|работа|использовала|использовал|монтаж|монтировала|монтировал)\s+/iu,
      "",
    )
    .replace(/[.,;:]+$/u, "")
    .trim();
}

function factCoverage(existing: string, candidate: string) {
  const existingTokens = new Set(textTokens(coreFactText(existing)));
  const candidateTokens = textTokens(coreFactText(candidate));
  if (!existingTokens.size || !candidateTokens.length) return 0;
  const matched = candidateTokens.filter((token) => existingTokens.has(token)).length;
  return matched / candidateTokens.length;
}

function isFactCovered(existing: string, candidate: string) {
  const existingKey = textKey(coreFactText(existing));
  const candidateKey = textKey(coreFactText(candidate));
  if (candidateKey.length >= 14 && existingKey.includes(candidateKey)) return true;
  if (existingKey.length >= 14 && candidateKey.includes(existingKey)) return true;
  return factCoverage(existing, candidate) >= 0.72 || similarity(existing, candidate) >= 0.6;
}

export function isCoveredByAny(items: string[], candidate: string) {
  return items.some((item) =>
    isNearDuplicate(item, candidate) || isFactCovered(item, candidate),
  );
}

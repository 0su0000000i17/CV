const CUSTOM_ANSWER_PREFIX = /^\(ответ кандидата своими словами\)\s*/iu;

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/giu)
    .filter((token) => token.length > 2);
}

export function extractAnswerLabel(fact: string) {
  const arrowIndex = fact.indexOf(" -> ");
  const label = arrowIndex === -1 ? fact : fact.slice(arrowIndex + 4);
  return label.replace(CUSTOM_ANSWER_PREFIX, "").trim();
}

export function splitSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function isNearVerbatim(answerLabel: string, resumeLine: string) {
  const labelTokens = tokenize(answerLabel);
  if (!labelTokens.length) return false;
  const lineTokens = tokenize(resumeLine);
  if (!lineTokens.length) return false;
  const matched = labelTokens.filter((token) => lineTokens.includes(token)).length;
  return matched / labelTokens.length >= 0.75 && matched / lineTokens.length >= 0.5;
}

export function stems(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-zа-я0-9+#.]+/giu)
    .filter((token) => token.length > 2)
    .map((token) => token.slice(0, 4));
}

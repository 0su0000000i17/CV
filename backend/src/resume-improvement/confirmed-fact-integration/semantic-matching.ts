const STOP_WORDS = new Set([
  "для", "как", "что", "это", "при", "или", "был", "была", "были",
  "ваш", "ваша", "ваше", "какой", "какая", "какие", "работа", "работы",
  "опыт", "можно", "подтвердить", "кандидат", "candidate", "with", "from",
  "that", "this",
]);

export function semanticTokens(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-zа-я0-9+#.]+/giu)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .map((token) =>
      /^[а-я]+$/u.test(token) && token.length > 6 ? token.slice(0, 6) : token
    );
}

export function tokenOverlap(firstValue: string, secondValue: string) {
  const first = new Set(semanticTokens(firstValue));
  const second = new Set(semanticTokens(secondValue));
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / Math.min(first.size, second.size);
}

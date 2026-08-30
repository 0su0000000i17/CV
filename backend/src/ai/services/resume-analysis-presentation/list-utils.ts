const EMPTY_PATTERN =
  /^(нет|нет проблем|нет явных проблем|не выявлено|отсутствуют|none|n\/a|-|—)$/i;

function normalizeAnalysisText(value: string) {
  const trimmed = value.trim();

  if (/hr[-\s]?скан/i.test(trimmed)) {
    return trimmed
      .replace(
        /быстрый\s+hr[-\s]?скан\s+слабый\s*:?\s*/iu,
        ""
      )
      .replace(/hr[-\s]?скан/giu, "первичный просмотр")
      .replace(
        /ключевые достижения и ценность кандидата не считываются за первые секунды\.?/iu,
        "Ключевые достижения и ценность кандидата стоит вынести ближе к началу: сейчас они считываются не сразу при первичном просмотре."
      )
      .replace(/^первичный просмотр\s+слабый\s*:?\s*/iu, "")
      .trim();
  }

  return trimmed;
}

export function isUseful(value: string) {
  return Boolean(value.trim()) && !EMPTY_PATTERN.test(value.trim());
}

export function cleanList(values: string[]) {
  const result: string[] = [];

  for (const value of values) {
    const item = normalizeAnalysisText(value);

    if (isUseful(item) && !result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}

export function addUnique(values: string[], value: string) {
  const item = normalizeAnalysisText(value);

  if (isUseful(item) && !values.includes(item)) {
    values.push(item);
  }
}

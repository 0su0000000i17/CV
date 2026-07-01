const EMPTY_PATTERN =
  /^(нет|нет проблем|нет явных проблем|не выявлено|отсутствуют|none|n\/a|-|—)$/i;

export function isUseful(value: string) {
  return Boolean(value.trim()) && !EMPTY_PATTERN.test(value.trim());
}

export function cleanList(values: string[]) {
  const result: string[] = [];

  for (const value of values) {
    const item = value.trim();

    if (isUseful(item) && !result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}

export function addUnique(values: string[], value: string) {
  if (!values.includes(value)) {
    values.push(value);
  }
}

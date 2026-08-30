export function isJsonWithinLimit(value: unknown, maxCharacters: number) {
  try {
    return JSON.stringify(value).length <= maxCharacters;
  } catch {
    return false;
  }
}

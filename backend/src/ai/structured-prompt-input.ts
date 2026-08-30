export function prepareStructuredPromptInput(value: string, maxChars: number) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length <= maxChars) return trimmed;

  try {
    const compact = JSON.stringify(JSON.parse(trimmed));
    if (compact.length > maxChars) {
      console.warn(
        `[ai] Structured prompt input exceeds the soft ${maxChars}-character limit; preserving complete valid JSON (${compact.length} characters).`,
      );
    }
    return compact;
  } catch {
    return trimmed.slice(0, maxChars);
  }
}

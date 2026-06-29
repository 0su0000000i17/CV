export function toNullableString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (isRecord(value)) {
    const textValue =
      value.text ?? value.value ?? value.name ?? value.title ?? value.label;

    return typeof textValue === "string" ? toNullableString(textValue) : null;
  }

  return null;
}

export function toStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(toNullableString)
    .filter((item): item is string => Boolean(item))
    .slice(0, limit);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

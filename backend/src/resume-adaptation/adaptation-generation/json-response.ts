export function parseJsonFromModelResponse(response: string) {
  const normalized = response
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized) as unknown;
  } catch {
    const balancedJson = extractBalancedJsonObject(normalized);

    if (!balancedJson) {
      throw new Error(
        `No JSON object in AI adaptation response. Raw response: ${normalized.slice(
          0,
          1500
        )}`
      );
    }

    try {
      return JSON.parse(balancedJson) as unknown;
    } catch {
      throw new Error(
        `Invalid JSON in AI adaptation response. Raw response: ${normalized.slice(
          0,
          1500
        )}`
      );
    }
  }
}

function extractBalancedJsonObject(text: string) {
  const firstBraceIndex = text.indexOf("{");

  if (firstBraceIndex === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = firstBraceIndex; index < text.length; index += 1) {
    const char = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(firstBraceIndex, index + 1).trim();
      }
    }
  }

  return null;
}

function normalizeRawText(rawText: string) {
  return rawText.trim().replace(/^\uFEFF/, "")
    .replace(/^```json\s*/i, "```json\n").replace(/^```\s*/i, "```\n");
}

function extractBalancedJsonObject(text: string) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}" && --depth === 0) return text.slice(start, index + 1).trim();
  }
  return null;
}

export function getJsonCandidates(rawText: string) {
  const text = normalizeRawText(rawText);
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const outer = start >= 0 && end > start ? text.slice(start, end + 1).trim() : null;
  return [...new Set([text, fenced, extractBalancedJsonObject(text), outer]
    .filter((candidate): candidate is string => Boolean(candidate)))];
}

export type NormalizedSourceResumeText = {
  text: string;
  lines: string[];
  serviceLines: string[];
  ignoredVisualLines: string[];
};

const pageMarkerPattern = /<PARSED TEXT FOR PAGE:\s*\d+\s*\/\s*\d+>/gi;
const updateLinePattern = /^(?:.+?\s+•\s*)?Резюме обновлено\s+.+$/i;
const visualHhLinePattern = /^(?:hh|hh\.ru|headhunter)$/i;

export function normalizeSourceResumeText(value: string): NormalizedSourceResumeText {
  const prepared = value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(pageMarkerPattern, "\n")
    .replace(/[ \t]+$/gm, "")
    .trim();

  const serviceLines: string[] = [];
  const ignoredVisualLines: string[] = [];

  const lines = prepared
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => {
      if (updateLinePattern.test(line)) {
        if (!serviceLines.includes(line)) {
          serviceLines.push(line);
        }

        return false;
      }

      if (visualHhLinePattern.test(line)) {
        ignoredVisualLines.push(line);
        return false;
      }

      return true;
    });

  return {
    text: lines.join("\n"),
    lines,
    serviceLines,
    ignoredVisualLines,
  };
}

export function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeTextValue(value: string | null | undefined) {
  return normalizeLine(value ?? "") || null;
}

export function uniqueStrings(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const value = normalizeLine(item);
    const key = value.toLowerCase();

    if (!value || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}
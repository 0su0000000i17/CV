import { extractMetricTokens } from "../utils/metric-text.js";
import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import type { ResumePromptPayload } from "./improvement-prompts/types.js";

export type DroppedMetric = {
  sourceIndex: number;
  company: string | null;
  tokens: string[];
};

// METRIC_TOKEN_PATTERN only matches unit-suffixed values (%, times, months...)
// by design - a bare count like "20 React-компонентов" or "80 ре-рендеров"
// intentionally doesn't qualify there (see utils/metric-text.ts), since a
// bare number is too ambiguous to safely use as a *fabrication* guard
// (it could be a version number, a date fragment, anything). But for THIS
// check - "did we silently drop a number the candidate already had" - that
// ambiguity doesn't matter: any bare count that vanishes from a bullet
// during rewrite is worth catching. Four-digit numbers starting with 19/20
// are excluded as a cheap year filter.
const BARE_NUMBER_PATTERN = /\d+/g;

function isLikelyYear(token: string) {
  return /^(19|20)\d{2}$/.test(token);
}

function extractBareNumberTokens(text: string): string[] {
  const matches = text.match(BARE_NUMBER_PATTERN) || [];
  return matches.filter((token) => !isLikelyYear(token));
}

function extractSourceBulletsBySourceIndex(resumeMarkdown: string) {
  const map = new Map<number, string[]>();

  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const items = parsed.experience?.items || [];

    items.forEach((item, index) => {
      const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
      const bulletTexts = (item.blocks || [])
        .filter((block) => block.type === "bullet" && block.text)
        .map((block) => block.text || "");
      map.set(sourceIndex, bulletTexts);
    });
  } catch {
    // Best-effort validation only - if the payload isn't parseable JSON,
    // skip the check rather than block generation on it.
  }

  return map;
}

// Catches the improvement model quietly dropping a metric that was already
// safely present in the source bullet for the same experience item - a
// direct violation of the system prompt's own "preserve the exact metric"
// rule that isn't otherwise checked after generation.
export function findDroppedMetrics(
  resumeMarkdown: string,
  adaptation: ResumeAdaptationResult
): DroppedMetric[] {
  const sourceBulletsByIndex = extractSourceBulletsBySourceIndex(resumeMarkdown);
  const dropped: DroppedMetric[] = [];

  for (const [sourceIndex, sourceBullets] of sourceBulletsByIndex) {
    const sourceText = sourceBullets.join("\n");
    const sourceTokens = new Set([
      ...extractMetricTokens(sourceText),
      ...extractBareNumberTokens(sourceText),
    ]);
    if (!sourceTokens.size) continue;

    const adaptedItem = adaptation.adaptedResume.experience.find(
      (item) => item.sourceIndex === sourceIndex
    );
    const adaptedText = (adaptedItem?.adaptedBullets || []).join("\n");
    const adaptedTokens = new Set([
      ...extractMetricTokens(adaptedText),
      ...extractBareNumberTokens(adaptedText),
    ]);

    const missing = [...sourceTokens].filter((token) => !adaptedTokens.has(token));
    if (missing.length) {
      dropped.push({ sourceIndex, company: adaptedItem?.company ?? null, tokens: missing });
    }
  }

  return dropped;
}

export function createMetricPreservationRetryNotice(dropped: DroppedMetric[]) {
  const lines = dropped.map(
    (item) =>
      `- ${item.company || `место работы с sourceIndex ${item.sourceIndex}`}: пропали цифры "${item.tokens.join('", "')}"`
  );

  return `
В твоём предыдущем ответе пропали цифры, которые были в исходном резюме - это нарушает
правило "если исходный bullet содержит цифру - сохрани её точное значение".

Пропавшие цифры:
${lines.join("\n")}

Верни результат заново. Формулировки вокруг можно менять, но каждая из этих цифр должна
остаться в adaptedBullets того же места работы, в точности как в исходном резюме.
`.trim();
}

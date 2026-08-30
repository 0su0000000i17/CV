import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import { extractMetricTokens } from "../utils/metric-text.js";
import type { ResumePromptPayload } from "./improvement-prompts/types.js";

export type DroppedSummaryMetric = {
  token: string;
  sourceText: string;
};

export function findDroppedSummaryMetrics(
  resumeJson: string,
  adaptation: ResumeAdaptationResult
): DroppedSummaryMetric[] {
  try {
    const parsed = JSON.parse(resumeJson) as ResumePromptPayload;
    const sourceLines = parsed.additional?.about || [];
    const adaptedTokens = new Set(
      extractMetricTokens(adaptation.adaptedResume.summary || "")
    );
    const dropped: DroppedSummaryMetric[] = [];
    const seen = new Set<string>();

    for (const sourceText of sourceLines) {
      for (const token of extractMetricTokens(sourceText)) {
        if (adaptedTokens.has(token) || seen.has(token)) continue;
        seen.add(token);
        dropped.push({ token, sourceText });
      }
    }
    return dropped;
  } catch {
    return [];
  }
}

export function createSummaryMetricRetryNotice(dropped: DroppedSummaryMetric[]) {
  const lines = dropped.map(
    (item) => `- метрика «${item.token}» из исходного summary: «${item.sourceText}»`
  );
  return `
В новом summary пропали подтверждённые количественные доказательства:
${lines.join("\n")}

Верни полный JSON заново и сохрани эти метрики именно в summary. Можно переписать окружение,
но нельзя заменять конкретное доказательство общими словами или оставлять его только в опыте.
`.trim();
}

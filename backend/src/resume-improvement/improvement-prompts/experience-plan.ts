import type { ResumePromptPayload } from "./types.js";

function requiredMinBullets(sourceCount: number) {
  if (sourceCount <= 0) return 0;
  if (sourceCount <= 5) return sourceCount;
  return Math.min(sourceCount, 10);
}

function countMetrics(text: string) {
  const matches = text.match(
    /\d+(?:[.,]\d+)?\s*(?:%|сек|с\b|мин|час|дн|нед|мес|год|раз|x|тыс|млн|\+)?/giu
  );

  return matches?.length || 0;
}

function getBlockTexts(
  item: NonNullable<ResumePromptPayload["experience"]>["items"] extends Array<infer T>
    ? T
    : never,
  type: string
) {
  return (item.blocks || [])
    .filter((block) => block.type === type && block.text)
    .map((block) => block.text || "");
}

function getStackTexts(
  item: NonNullable<ResumePromptPayload["experience"]>["items"] extends Array<infer T>
    ? T
    : never
) {
  return (item.blocks || [])
    .map((block) => block.text || "")
    .filter((text) => /^стек\s*:/iu.test(text.trim()))
    .map((text) => text.trim().replace(/\s+/g, " "));
}

function createExperienceLine(
  item: NonNullable<ResumePromptPayload["experience"]>["items"] extends Array<infer T>
    ? T
    : never,
  index: number
) {
  const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
  const bulletTexts = getBlockTexts(item, "bullet");
  const stackTexts = getStackTexts(item);
  const sourceCount = bulletTexts.length;
  const metricsCount = countMetrics(bulletTexts.join("\n"));
  const metricPoor = sourceCount >= 3 && metricsCount < Math.ceil(sourceCount * 0.35);
  const requiredBullets = requiredMinBullets(sourceCount) || sourceCount || 1;
  const minMetricBullets = metricPoor
    ? Math.max(2, Math.ceil(requiredBullets * 0.6))
    : Math.max(1, Math.ceil(requiredBullets * 0.35));
  const company = item.company?.name || "компания не указана";
  const position = item.position || "должность не указана";
  const dates = [item.dates?.start, item.dates?.end].filter(Boolean).join(" — ") || "даты не указаны";
  const stackNote = stackTexts.length
    ? `; стек: ${stackTexts.join(" / ")} — обязательно сохрани в focus`
    : "";

  return `- sourceIndex ${sourceIndex}: ${company}; ${position}; ${dates}; исходно ${sourceCount} bullets; найдено метрик: ${metricsCount}; ${metricPoor ? "МАЛО МЕТРИК — добавь inferred-метрики" : "метрики частично есть"}; верни минимум ${requiredBullets} adaptedBullets, из них минимум ${minMetricBullets} bullets с числами/диапазонами/сроками/объёмом${stackNote}`;
}

export function createExperiencePlanPrompt(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const items = parsed.experience?.items || [];
    const lines = items.map(createExperienceLine);

    return lines.length
      ? `ОБЯЗАТЕЛЬНЫЙ ПЛАН ОПЫТА И МЕТРИК:\n${lines.join("\n")}`
      : "";
  } catch {
    return "";
  }
}

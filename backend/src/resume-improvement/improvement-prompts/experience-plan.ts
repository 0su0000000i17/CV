import type { ResumePromptPayload } from "./types.js";

type ExperienceItem = {
  sourceIndex?: number;
  company?: { name?: string | null };
  position?: string | null;
  dates?: { start?: string | null; end?: string | null };
  blocks?: Array<{ type?: string; text?: string | null }>;
};

function requiredMinBullets(sourceCount: number) {
  if (sourceCount <= 0) return 0;
  if (sourceCount <= 5) return sourceCount;
  return Math.min(sourceCount, 10);
}

function getBlockTexts(item: ExperienceItem, type: string) {
  return (item.blocks || [])
    .filter((block) => block.type === type && block.text)
    .map((block) => block.text || "");
}

function getStackTexts(item: ExperienceItem) {
  return (item.blocks || [])
    .map((block) => block.text || "")
    .filter((text) => /^стек\s*:/iu.test(text.trim()))
    .map((text) => text.trim().replace(/\s+/g, " "));
}

function normalizeBulletText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findDuplicatedBullets(items: ExperienceItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const seen = new Set<string>();
    for (const text of getBlockTexts(item, "bullet")) {
      const normalized = normalizeBulletText(text);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([text]) => text));
}

function createExperienceLine(
  item: ExperienceItem,
  index: number,
  duplicatedBullets: Set<string>
) {
  const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
  const bulletTexts = getBlockTexts(item, "bullet");
  const stackTexts = getStackTexts(item);
  const sourceCount = bulletTexts.length;
  const duplicateCount = bulletTexts.filter((text) =>
    duplicatedBullets.has(normalizeBulletText(text))
  ).length;
  // Cross-place duplicates are template filler, not content: the model may
  // consolidate them, so they don't inflate the mandatory bullet floor.
  const requiredBullets =
    Math.max(
      duplicateCount ? 3 : 0,
      (requiredMinBullets(sourceCount) || sourceCount || 1) - duplicateCount
    ) || 1;
  const company = item.company?.name || "компания не указана";
  const position = item.position || "должность не указана";
  const dates = [item.dates?.start, item.dates?.end].filter(Boolean).join(" — ") || "даты не указаны";
  const stackNote = stackTexts.length
    ? `; стек: ${stackTexts.join(" / ")} — обязательно сохрани в focus`
    : "";
  const duplicateNote = duplicateCount
    ? `; ВНИМАНИЕ: ${duplicateCount} bullets этого места дословно повторяются в других местах работы — замени их формулировками про уникальный вклад именно здесь (ниша, аудитория, задача, результат из подтверждённых фактов), дословные копии между местами не допускаются`
    : "";

  return `- sourceIndex ${sourceIndex}: ${company}; ${position}; ${dates}; исходно ${sourceCount} bullets; верни минимум ${requiredBullets} adaptedBullets, сохраняя все исходные цифры дословно и не добавляя новых${stackNote}${duplicateNote}`;
}

function countSourceExperienceWords(items: ExperienceItem[]) {
  return items
    .flatMap((item) => (item.blocks || []).map((block) => block.text || ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function createExperiencePlanPrompt(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const items = parsed.experience?.items || [];
    const duplicatedBullets = findDuplicatedBullets(items);
    const lines = items.map((item, index) => createExperienceLine(item, index, duplicatedBullets));
    if (!lines.length) return "";

    // The model reliably compresses wordy source bullets into terse ones,
    // which drops the resume below the disclosure norm for the candidate's
    // seniority - give it the concrete number to hold instead of a
    // qualitative "don't shrink" rule.
    const sourceWords = countSourceExperienceWords(items);
    const volumeLine = sourceWords
      ? `\nКОНТРОЛЬ ОБЪЁМА: в исходном опыте суммарно ~${sourceWords} слов. Суммарный объём улучшенного опыта (bullets + focus) должен получиться НЕ МЕНЬШЕ ~${sourceWords} слов — расширяй формулировки конкретикой (инструменты, способ, масштаб, результат), а не сокращай.`
      : "";

    return `ОБЯЗАТЕЛЬНЫЙ ПЛАН ОПЫТА:\n${lines.join("\n")}${volumeLine}`;
  } catch {
    return "";
  }
}

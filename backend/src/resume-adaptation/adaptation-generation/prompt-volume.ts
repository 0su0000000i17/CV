import type { AdaptationSettings } from "../types.js";

type SourceResumeForCounts = {
  personal?: { gender?: string | null };
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      blocks?: Array<{ type?: string; text?: string | null; items?: string[] | null }>;
    }>;
  };
};

function formatSetting(value: boolean) {
  return value ? "включено" : "выключено";
}

export function createSettingsPrompt(settings: AdaptationSettings) {
  return `
НАСТРОЙКИ АДАПТАЦИИ:
- Сохранить стиль автора: ${formatSetting(settings.preserveAuthorStyle)}
- Усилить достижения: ${formatSetting(settings.strengthenAchievements)}
- Оптимизировать под ATS: ${formatSetting(settings.optimizeForAts)}
- Подстроить навыки под вакансию: ${formatSetting(settings.tailorSkillsToVacancy)}
- Сделать текст более конкретным: ${formatSetting(settings.makeTextMoreSpecific)}
`.trim();
}

function requiredMinBullets(sourceCount: number) {
  if (sourceCount <= 0) return 0;
  if (sourceCount <= 5) return sourceCount;
  return Math.min(sourceCount, 10);
}

export function parseSourceResumeForCounts(value: string) {
  return JSON.parse(value) as SourceResumeForCounts;
}

export function createBulletCountPrompt(resumeMarkdown: string) {
  try {
    const parsed = parseSourceResumeForCounts(resumeMarkdown);
    const items = parsed.experience?.items || [];
    let sourceWords = 0;
    const lines = items.map((item, index) => {
      const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
      const blockTexts = (item.blocks || [])
        .map((block) => String(block.text || "").trim()).filter(Boolean);
      sourceWords += blockTexts.join(" ").split(/\s+/).filter(Boolean).length;
      const sourceCount = (item.blocks || [])
        .filter((block) => block.type === "bullet" && block.text)
        .map((block) => String(block.text || "").trim()).filter(Boolean).length;
      const minCount = requiredMinBullets(sourceCount);
      if (!sourceCount || !minCount) return null;
      return `- sourceIndex ${sourceIndex}: исходно ${sourceCount} bullets; верни минимум ${minCount} adaptedBullets, сохраняя все исходные цифры дословно и не добавляя новых`;
    }).filter((line): line is string => Boolean(line));
    if (!lines.length) return "";

    const volumeLines = sourceWords
      ? `\nКОНТРОЛЬ ОБЪЁМА: в исходном опыте суммарно ~${sourceWords} слов. Суммарный объём адаптированного опыта (bullets + focus) должен получиться НЕ МЕНЬШЕ ~${sourceWords} слов. Объём и глубина резюме НЕ зависят от длины текста вакансии: короткая вакансия — НЕ повод сокращать резюме, адаптация меняет акценты и формулировки, а не урезает опыт.`
      : "";
    return `
ОБЯЗАТЕЛЬНЫЙ ПЛАН ОБЪЁМА ПО КАЖДОМУ МЕСТУ РАБОТЫ:
${lines.join("\n")}
${volumeLines}

Если по sourceIndex вернёшь меньше указанного минимума adaptedBullets, ответ считается невалидным. Не добавляй цифр, которых нет в исходном резюме, даже чтобы выглядеть увереннее — лучше меньше bullets, чем придуманная метрика.
`.trim();
  } catch {
    return "";
  }
}

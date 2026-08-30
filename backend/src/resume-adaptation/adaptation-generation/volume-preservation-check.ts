import type { ResumeAdaptationResult } from "../types.js";

type ExperienceBlocksPayload = {
  experience?: {
    items?: Array<{
      blocks?: Array<{ type?: string; text?: string | null }>;
    }>;
  };
};

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function countSourceExperienceWords(resumeJson: string) {
  try {
    const parsed = JSON.parse(resumeJson) as ExperienceBlocksPayload;
    const items = parsed.experience?.items || [];
    return countWords(
      items
        .flatMap((item) => (item.blocks || []).map((block) => block.text || ""))
        .join(" ")
    );
  } catch {
    return 0;
  }
}

function countAdaptedExperienceWords(adaptation: ResumeAdaptationResult) {
  return countWords(
    adaptation.adaptedResume.experience
      .flatMap((item) => [...(item.adaptedBullets || []), item.focus || ""])
      .join(" ")
  );
}

/**
 * The model reliably compresses the experience section - especially when the
 * vacancy text is short - even with an explicit numeric floor in the prompt.
 * A resume that shrank below the disclosure norm for the candidate's
 * seniority scores WORSE after adaptation, so a materially shrunken result
 * gets one retry with the violation named (same single-retry budget as the
 * metric-preservation and first-person guards).
 */
export function findVolumeShrink(resumeJson: string, adaptation: ResumeAdaptationResult) {
  const sourceWords = countSourceExperienceWords(resumeJson);
  const adaptedWords = countAdaptedExperienceWords(adaptation);
  // Blocks include section titles/paragraph noise the adaptation legitimately
  // drops, so a modest reduction is fine - only a material shrink retries.
  if (!sourceWords || adaptedWords >= sourceWords * 0.85) return null;
  return { sourceWords, adaptedWords };
}

export function createVolumeRetryNotice(shrink: { sourceWords: number; adaptedWords: number }) {
  return `
ТВОЙ ОТВЕТ НАРУШИЛ КОНТРОЛЬ ОБЪЁМА: в исходном опыте ~${shrink.sourceWords} слов, а в твоей
адаптации только ~${shrink.adaptedWords}. Резюме стало заметно короче исходного — это снижает
оценку кандидата: для его стажа опыт должен быть раскрыт подробно, и короткая вакансия не повод
сокращать резюме.

Верни ИСПРАВЛЕННЫЙ полный JSON той же схемы, в котором:
- каждое место работы сохраняет все исходные bullets в усиленном виде (адаптируй формулировки,
  а не выбрасывай факты);
- суммарный объём опыта (bullets + focus) не меньше ~${shrink.sourceWords} слов;
- все прежние правила соблюдены: никаких новых цифр, кроме дословных из исходника и
  подтверждённых кандидатом фактов.
`.trim();
}

import { createExperiencePlanPrompt } from "./experience-plan.js";
import type { ResumePromptPayload } from "./types.js";

function createGenderInstruction(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const gender = parsed.personal?.gender?.trim();

    if (/женщина/i.test(gender || "")) {
      return "ПОЛ КАНДИДАТА: Женщина. Пиши опыт, summary и focus в женском роде. Нельзя использовать мужские формы.";
    }

    if (/мужчина/i.test(gender || "")) {
      return "ПОЛ КАНДИДАТА: Мужчина. Пиши опыт, summary и focus в мужском роде.";
    }
  } catch {
    return "ПОЛ КАНДИДАТА: не указан. Используй нейтральные формулировки.";
  }

  return "ПОЛ КАНДИДАТА: не указан. Используй нейтральные формулировки.";
}

export function createUserPrompt(resumeMarkdown: string) {
  return `
${createGenderInstruction(resumeMarkdown)}

${createExperiencePlanPrompt(resumeMarkdown)}

ИСХОДНОЕ РЕЗЮМЕ:
"""
${resumeMarkdown}
"""

УЛУЧШИ РЕЗЮМЕ КАК ГОТОВЫЙ ATS-FRIENDLY ЧЕРНОВИК.

КРИТИЧЕСКОЕ ТРЕБОВАНИЕ ПО МЕТРИКАМ:
- Если в плане опыта написано "МАЛО МЕТРИК", простой результат без новых чисел невалиден.
- Не заменяй метрики словами "ускорило", "повысило", "улучшило" без числа.
- Для backend/dev опыта добавь логические метрики прямо в bullets: проценты, сроки, объёмы, частоту, диапазоны.
- Это не фантазия, а аккуратное inferred evidence из подтверждённой задачи.

Верни JSON строго по той же schema, что адаптация резюме:
{
  "summary": "string|null",
  "headline": "string|null",
  "skills": {
    "primary": ["string"],
    "secondary": ["string"]
  },
  "experience": [
    {
      "sourceIndex": 0,
      "focus": "string|null",
      "adaptedBullets": ["string"],
      "preservedFacts": ["string"],
      "warnings": ["string"]
    }
  ],
  "keywordsUsed": ["string"],
  "warnings": ["string"]
}
`.trim();
}

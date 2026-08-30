import type { ResumeAnalysisSignals } from "../clarifying-questions/types.js";
import { createExperiencePlanPrompt } from "./experience-plan.js";
import { createAnalysisSignalsBlock } from "./analysis-signals-prompt.js";
import {
  createGenderInstruction,
  createSummaryEvidenceBlock,
} from "./candidate-context.js";
import { createConfirmedFactsBlock } from "./confirmed-facts-prompt.js";

export function createUserPrompt(
  resumeMarkdown: string,
  confirmedFacts?: string[],
  analysisSignals?: ResumeAnalysisSignals
) {
  const confirmedFactsBlock = createConfirmedFactsBlock(confirmedFacts);
  const analysisSignalsBlock = createAnalysisSignalsBlock(analysisSignals);
  const summaryEvidenceBlock = createSummaryEvidenceBlock(resumeMarkdown);

  return `
${createGenderInstruction(resumeMarkdown)}

${createExperiencePlanPrompt(resumeMarkdown)}
${summaryEvidenceBlock ? `\n${summaryEvidenceBlock}\n` : ""}${analysisSignalsBlock ? `\n${analysisSignalsBlock}\n` : ""}${confirmedFactsBlock ? `\n${confirmedFactsBlock}\n` : ""}
ИСХОДНОЕ РЕЗЮМЕ:
"""
${resumeMarkdown}
"""

УЛУЧШИ РЕЗЮМЕ КАК ГОТОВЫЙ ATS-FRIENDLY ЧЕРНОВИК БЕЗ ПРИВЯЗКИ К ВАКАНСИИ.

ТРЕБОВАНИЕ ПО ЦИФРАМ:
- Не добавляй новых чисел, диапазонов, сроков и частот, которых нет в исходном резюме — план опыта выше задаёт только требуемое количество bullets, а не количество метрик.
- Заменяй "ускорило", "повысило", "улучшило" конкретными качественными деталями (что именно, чем, для кого, каким способом), а не числом, если числа не было в исходнике.
- Не добавляй фантастические KPI без опоры: выручку, ROI, CAC, LTV, бюджеты, миллионы пользователей.

ОБЯЗАТЕЛЬНАЯ JSON-СХЕМА:
- Верни строго полную schema адаптации с ключом adaptedResume.
- НЕЛЬЗЯ возвращать top-level поля summary/headline/skills/experience без adaptedResume.
- Если вернёшь summary/headline/skills/experience на верхнем уровне, ответ считается невалидным.

СХЕМА JSON:
{
  "target": {
    "title": null,
    "company": null,
    "seniority": null,
    "salary": null,
    "specializations": [],
    "employment": null,
    "schedule": null,
    "workFormat": null,
    "commuteTime": null,
    "keywordsUsed": []
  },
  "adaptedResume": {
    "headline": "string|null",
    "summary": "string|null",
    "skills": {
      "primary": ["string"],
      "secondary": ["string"],
      "deprioritized": [],
      "notAdded": []
    },
    "experience": [
      {
        "sourceIndex": 0,
        "company": "string|null",
        "position": "string|null",
        "dates": "string|null",
        "focus": "string|null",
        "adaptedBullets": ["string"],
        "preservedFacts": ["string"],
        "warnings": ["string"]
      }
    ],
    "education": {
      "policy": "unchanged",
      "notes": []
    },
    "additionalInfo": []
  },
  "changes": ["string"],
  "warnings": ["string"],
  "forbiddenClaims": []
}

ВАЖНО:
- Сохрани все sourceIndex и порядок мест работы.
- Не меняй компании, даты, должности, образование и личные данные.
- Стек каждого места работы сохраняй в focus этого же sourceIndex, если он есть в исходнике.
- adaptedBullets должны быть усиленными формулировками, а не копией исходника.
- Для каждого значимого места работы верни столько bullets, сколько требует план опыта выше.
- НЕ СЖИМАЙ ОПЫТ: суммарный объём текста опыта в улучшенном резюме не должен стать меньше
  исходного. Улучшение = конкретизация и усиление формулировок, а не сокращение. Для уровня
  кандидата с многолетним стажем недостаточно раскрытый опыт снижает оценку рекрутера так же
  сильно, как вода. Убирать можно только пустые клише — их заменяй конкретикой, а не пробелом.

Верни только валидный JSON без markdown и без текста вокруг.
`.trim();
}

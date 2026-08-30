import type { AdaptationSettings, ResumeVacancyFitResult } from "../types.js";
import { createAdaptationFitPrompt, createGenderPrompt } from "./prompt-candidate-context.js";
import { createConfirmedFactsBlock } from "./prompt-confirmed-facts.js";
import { createBulletCountPrompt, createSettingsPrompt } from "./prompt-volume.js";

export function createUserPrompt(params: {
  resumeMarkdown: string;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
  confirmedFacts?: string[];
}) {
  const confirmedFactsBlock = createConfirmedFactsBlock(params.confirmedFacts);
  return `
${createGenderPrompt(params.resumeMarkdown)}

РЕЗЮМЕ КАНДИДАТА:
"""
${params.resumeMarkdown}
"""

ВАКАНСИЯ:
"""
${params.vacancyText}
"""

РЕЗУЛЬТАТ ПРОВЕРКИ СОВМЕСТИМОСТИ, ОЧИЩЕННЫЙ ДЛЯ АДАПТАЦИИ:
${createAdaptationFitPrompt(params.fit)}
${confirmedFactsBlock ? `\n${confirmedFactsBlock}\n` : ""}
${createSettingsPrompt(params.settings)}

${createBulletCountPrompt(params.resumeMarkdown)}

ТРЕБОВАНИЕ ПО ЦИФРАМ:
- Не добавляй новых чисел, диапазонов, сроков и частот, которых нет в исходном резюме — план объёма выше задаёт только требуемое количество bullets, а не количество метрик.
- Заменяй "ускорило", "повысило", "улучшило", "увеличило" конкретными качественными деталями (что именно, чем, для кого, каким способом), а не числом, если числа не было в исходнике.
- Не добавляй фантастические KPI без опоры: выручку, ROI, CAC, LTV, бюджеты, миллионы пользователей, заявки, CTR и охваты.

СДЕЛАЙ АДАПТАЦИЮ ВНУТРИ СЕБЯ ПО ЦЕПОЧКЕ:
1. Определи роль, уровень, домен, задачи и ATS-слова вакансии.
2. Найди прямые и сильные косвенные подтверждения в резюме.
3. Для каждого релевантного факта построй логический вывод: факт → неизбежные действия → более конкретная и уверенная формулировка, без изобретения чисел.
4. Не добавляй неподтверждённые компании, должности, домены, проекты, метрики и фантастические KPI.
5. Сохрани все места работы и сопоставимый объём bullets.
6. Не дублируй исходные формулировки рядом с усиленными.
7. Разведи похожие места работы по акцентам, чтобы они не выглядели как один и тот же блок, скопированный несколько раз.
8. Верни только JSON.

СХЕМА JSON:
{
  "target": { "title": null, "company": null, "seniority": null, "salary": null, "specializations": [], "employment": null, "schedule": null, "workFormat": null, "commuteTime": null, "keywordsUsed": [] },
  "adaptedResume": { "headline": "", "summary": "", "skills": { "primary": [], "secondary": [], "deprioritized": [], "notAdded": [] }, "experience": [], "education": { "policy": "unchanged", "notes": [] }, "additionalInfo": [] },
  "changes": [], "warnings": [], "forbiddenClaims": []
}

ФОРМАТ EXPERIENCE:
{
  "sourceIndex": 0,
  "company": "строка или null",
  "position": "строка или null",
  "dates": "строка или null",
  "adaptedBullets": ["строка", "строка"],
  "focus": "строка или null",
  "preservedFacts": ["строка"],
  "warnings": ["строка"]
}

ВАЖНО:
- Если в исходном месте работы 12-13 bullets, верни 10-13 адаптированных bullets.
- Если в исходном месте работы 5 bullets, верни 5 адаптированных bullets.
- adaptedBullets не должны быть копией исходных bullets, но и не должны содержать чисел, которых не было в исходнике.
- Summary — переписанный заново под эту вакансию питч на 2-4 предложения от первого лица без местоимения "я": первое предложение может быть номинальным ("SMM-специалист с опытом..."), дальше "специализируюсь / выстраиваю / развиваю". Нельзя причастия ("специализирующийся") и третье лицо ("разрабатывает"). В summary нет ни одного факта, который также встречается в additionalInfo или является job-specific фактом одного места работы.
- Род всех глаголов должен соответствовать блоку ПОЛ КАНДИДАТА выше.

Верни только JSON.
`.trim();
}

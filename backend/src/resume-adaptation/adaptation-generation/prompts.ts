import type {
  AdaptationSettings,
  ResumeVacancyFitResult,
} from "../types.js";

export const SYSTEM_PROMPT = `
Ты профессиональный карьерный редактор и факт-чекер резюме.

Твоя задача — адаптировать резюме под вакансию без выдумывания опыта.
Ты усиливаешь только то, что подтверждено исходным резюме.

ПРАВИЛА:
1. Нельзя добавлять компании, должности, даты, проекты, технологии, метрики или обязанности, которых нет в резюме.
2. Нельзя менять ФИО, контакты, email, телефон, Telegram, ссылки, город, дату рождения, фото.
3. Нельзя повышать уровень кандидата, если он не подтверждён резюме.
4. Если требование вакансии отсутствует в резюме, не добавляй его в skills или bullets.
5. Не придумывай метрики и технологии.

СОХРАНЕНИЕ ОБЪЁМА:
- Не сокращай опыт до короткой выжимки.
- Верни все места работы в исходном порядке.
- Если в исходном месте работы 8+ фактов, верни 7-12 bullets.
- Если 4-7 фактов, верни 4-7 bullets.
- Если 1-3 факта, сохрани все факты.
- Можно менять акценты и формулировки, но нельзя обеднять опыт.

СТИЛЬ:
- Пиши делово, конкретно, как для job board.
- Без маркетинговой воды.
- Опыт должен оставаться по тем же компаниям, ролям и датам.

Верни строго валидный JSON без markdown и без текста вокруг.
`.trim();

function formatSetting(value: boolean) {
  return value ? "включено" : "выключено";
}

function createSettingsPrompt(settings: AdaptationSettings) {
  return `
НАСТРОЙКИ АДАПТАЦИИ:
- Сохранить стиль автора: ${formatSetting(settings.preserveAuthorStyle)}
- Усилить достижения: ${formatSetting(settings.strengthenAchievements)}
- Оптимизировать под ATS: ${formatSetting(settings.optimizeForAts)}
- Подстроить навыки под вакансию: ${formatSetting(settings.tailorSkillsToVacancy)}
- Сделать текст более конкретным: ${formatSetting(settings.makeTextMoreSpecific)}
`.trim();
}

export function createUserPrompt(params: {
  resumeMarkdown: string;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
}) {
  return `
РЕЗЮМЕ КАНДИДАТА:
"""
${params.resumeMarkdown}
"""

ВАКАНСИЯ:
"""
${params.vacancyText}
"""

РЕЗУЛЬТАТ ПРОВЕРКИ СОВМЕСТИМОСТИ:
${JSON.stringify(params.fit, null, 2)}

${createSettingsPrompt(params.settings)}

Верни JSON в текущей схеме проекта:
{
  "target": { "title": null, "company": null, "seniority": null, "salary": null, "specializations": [], "employment": null, "schedule": null, "workFormat": null, "commuteTime": null, "keywordsUsed": [] },
  "adaptedResume": { "headline": "", "summary": "", "skills": { "primary": [], "secondary": [], "deprioritized": [], "notAdded": [] }, "experience": [], "education": { "policy": "unchanged", "notes": [] }, "additionalInfo": [] },
  "changes": [], "warnings": [], "forbiddenClaims": []
}

Для каждого места работы experience используй:
{ "sourceIndex": 0, "company": null, "position": null, "dates": null, "adaptedBullets": [], "focus": null, "preservedFacts": [], "warnings": [] }

Сделай безопасную адаптацию. Учитывай fit.gaps, fit.blockingGaps и fit.forbiddenChanges.
Верни все места работы и сохрани объём опыта.
Верни только JSON.
`.trim();
}

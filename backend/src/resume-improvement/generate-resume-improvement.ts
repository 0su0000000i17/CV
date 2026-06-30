import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import { ADAPT_MAX_TOKENS, ADAPT_RESUME_MAX_CHARS } from "../resume-adaptation/adaptation-generation/config.js";
import { parseJsonFromModelResponse } from "../resume-adaptation/adaptation-generation/json-response.js";
import { normalizeAdaptationResult } from "../resume-adaptation/adaptation-generation/normalize-adaptation-result.js";
import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";

export type GenerateResumeImprovementOutput = {
  improvement: ResumeAdaptationResult;
  generation: { provider: string; model: string };
  meta: { resumeChars: number };
};

function getImprovementModelOverride() {
  return process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() || undefined;
}

export async function generateResumeImprovement(params: {
  resumeMarkdown: string;
}): Promise<GenerateResumeImprovementOutput> {
  const resumeForPrompt = params.resumeMarkdown.trim().slice(0, ADAPT_RESUME_MAX_CHARS);
  const aiProvider = getAiProvider();
  const messages: AiMessage[] = [
    { role: "system", content: createSystemPrompt() },
    { role: "user", content: createUserPrompt(resumeForPrompt) },
  ];
  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    modelOverride: getImprovementModelOverride(),
  });
  const parsedJson = parseJsonFromModelResponse(generationResult.text);

  return {
    improvement: normalizeAdaptationResult(parsedJson),
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: { resumeChars: resumeForPrompt.length },
  };
}

function createSystemPrompt() {
  return `
Ты карьерный редактор и ATS-специалист. Улучши резюме без привязки к вакансии: сделай опыт конкретнее, сильнее и понятнее для HR и автоматического отбора.

Правила:
- Определи профессию и уровень кандидата по исходному резюме.
- Сохрани реальные компании, должности, даты, образование, контакты и порядок опыта.
- Не добавляй компании, проекты, технологии, сертификаты, языки, должности и стаж, которых нет в источнике.
- Не используй первое лицо и клише без доказательств.
- Каждый bullet опыта пиши по логике: глагол действия + задача / действие + измеримый результат.
- Если метрик мало, добавляй осторожные inferred-метрики только при логической опоре в исходном опыте: проценты, сроки, объём, скорость, регулярность, снижение ручной работы, производительность, качество, SLA, Core Web Vitals, LCP, SQL, API, интеграции, контент-метрики — только если это подходит домену кандидата.
- Не пиши фантастические показатели вроде выручки, бюджетов, миллионов пользователей, ROI, CAC, LTV без прямой опоры.
- Навыки очисти от дублей, сохрани подтверждённые hard skills и аббревиатуры.
- Верни все места работы и сопоставимый объём bullets.
- Верни строго JSON без markdown.
`.trim();
}

function createUserPrompt(resumeMarkdown: string) {
  return `
ИСХОДНОЕ РЕЗЮМЕ:
"""
${resumeMarkdown}
"""

Улучши резюме как готовый ATS-friendly черновик. Не адаптируй под конкретную вакансию.

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
  "adaptedBullets": ["строка"],
  "focus": "строка или null",
  "preservedFacts": ["строка"],
  "warnings": ["строка"]
}

Верни только JSON.
`.trim();
}

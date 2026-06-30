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

type ResumePromptPayload = {
  personal?: { gender?: string | null };
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      company?: { name?: string | null };
      position?: string | null;
      dates?: { start?: string | null; end?: string | null };
      blocks?: Array<{ type?: string; text?: string | null }>;
    }>;
  };
};

function getImprovementModelOverride() {
  return process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() || undefined;
}

function getImprovementMaxTokens() {
  const envValue = Number(process.env.AI_IMPROVE_MAX_TOKENS);
  if (Number.isFinite(envValue) && envValue > 0) return envValue;
  return Math.max(ADAPT_MAX_TOKENS, 4200);
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
    temperature: 0.12,
    maxTokens: getImprovementMaxTokens(),
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
Ты сильный карьерный редактор и ATS-редактор. Улучши резюме без привязки к вакансии: сделай опыт конкретнее, сильнее и понятнее для HR, сохранив факты кандидата.

ОСНОВНЫЕ ПРАВИЛА:
- Не адаптируй под конкретную вакансию.
- Не выдумывай компании, проекты, технологии, сертификаты, языки, должности, стаж и образование.
- Сохрани все места работы, sourceIndex, порядок опыта, должности и даты.
- Не объединяй разные места работы и не переноси bullets между ними.
- Не используй первое лицо: я, мой, моя, мы, наш, имею, умею.
- Summary пиши как профессиональное описание: "PHP Backend Developer с опытом...", а не "Имею опыт...".
- Убери приветствия и клише без доказательств.

РОД:
- Согласуй род с personal.gender.
- Женщина: разработала, подготовила, создавала, проводила, координировала, анализировала, внедрила, работала.
- Мужчина: разработал, подготовил, создавал, проводил, координировал, анализировал, внедрил, работал.
- Если пол не указан, используй нейтральные формулировки: разработка, создание, внедрение, координация, оптимизация.

ОПЫТ И МЕТРИКИ:
- Каждый bullet: действие + задача + результат.
- В каждом значимом месте работы добавь минимум 2 измеримых результата, если есть логическая опора.
- Если точной цифры нет, используй аккуратные диапазоны: 10-15%, 15-20%, 20-30%, до 2 раз, на 1-2 дня, 1-2 недели.
- Для backend/dev ролей усиливай через API, БД, SQL, интеграции, кеширование, очереди, стабильность, скорость обработки, снижение ручной работы, наблюдаемость, тесты, отчёты.
- Для frontend ролей усиливай через Core Web Vitals, LCP, рендер, загрузку, UX, SSR/CSR, состояние, графики.
- Для SMM/content ролей усиливай через регулярность контента, скорость производства, охваты, вовлечённость, визуальный стандарт, Reels, Stories, контент-план.
- Не добавляй бизнес-KPI без опоры.

НАВЫКИ:
- skills.primary и skills.secondary возвращай как массив отдельных навыков.
- Нельзя возвращать склейки вроде "PHP MySQL JavaScript" одним элементом.
- Убери дубли и варианты одного навыка: VueJS/Vue.js, PHPUnit/PhpUnit, PostgreSQL/Postgres.

ФОРМАТ:
- Верни строго валидный JSON без markdown и без текста вокруг.
- adaptedBullets, preservedFacts, warnings, skills и keywordsUsed — массивы строк.
`.trim();
}

function requiredMinBullets(sourceCount: number) {
  if (sourceCount <= 0) return 0;
  if (sourceCount <= 5) return sourceCount;
  return Math.min(sourceCount, 10);
}

function createExperiencePlanPrompt(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const items = parsed.experience?.items || [];
    const lines = items.map((item, index) => {
      const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
      const sourceCount = (item.blocks || []).filter((block) => block.type === "bullet" && block.text).length;
      const company = item.company?.name || "компания не указана";
      const position = item.position || "должность не указана";
      const dates = [item.dates?.start, item.dates?.end].filter(Boolean).join(" — ") || "даты не указаны";
      return `- sourceIndex ${sourceIndex}: ${company}; ${position}; ${dates}; исходно ${sourceCount} bullets; верни минимум ${requiredMinBullets(sourceCount) || sourceCount || 1} adaptedBullets`;
    });

    return lines.length ? `ОБЯЗАТЕЛЬНЫЙ ПЛАН ОПЫТА:\n${lines.join("\n")}` : "";
  } catch {
    return "";
  }
}

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

function createUserPrompt(resumeMarkdown: string) {
  return `
${createGenderInstruction(resumeMarkdown)}

${createExperiencePlanPrompt(resumeMarkdown)}

ИСХОДНОЕ РЕЗЮМЕ:
"""
${resumeMarkdown}
"""

УЛУЧШИ РЕЗЮМЕ КАК ГОТОВЫЙ ATS-FRIENDLY ЧЕРНОВИК.

САМОПРОВЕРКА ПЕРЕД ОТВЕТОМ:
- Все sourceIndex из плана опыта присутствуют.
- Нет первого лица: "Имею", "Умею", "Я", "мой", "мы".
- Род соответствует personal.gender.
- Нет skills-склеек вроде "PHP MySQL JavaScript".
- В каждом значимом месте работы есть измеримые результаты, если это логически возможно.

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

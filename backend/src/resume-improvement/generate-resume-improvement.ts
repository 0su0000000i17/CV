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
  target?: { title?: string | null };
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
  return (
    process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() ||
    undefined
  );
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
- Не используй первое лицо: я, мой, моя, мы, наш, имею, умею, работаю, специализируюсь.
- Summary пиши как профессиональное описание: "PHP Backend Developer с опытом...", а не "Имею опыт...".
- Если в исходном опыте есть строка "Стек:", сохрани её в focus этого же места работы отдельным коротким предложением.
- Стек не должен быть только в skills. Он должен быть виден прямо в описании соответствующего опыта.
- Не смешивай стек разных мест работы.
- Убери приветствия и клише без доказательств.

РОД:
- Согласуй род с personal.gender.
- Женщина: разработала, подготовила, создавала, проводила, координировала, анализировала, внедрила, работала.
- Мужчина: разработал, подготовил, создавал, проводил, координировал, анализировал, внедрил, работал.
- Если пол не указан, используй нейтральные формулировки: разработка, создание, внедрение, координация, оптимизация.

ГЛАВНОЕ: МЕТРИКИ ДЛЯ РЕЗЮМЕ БЕЗ МЕТРИК:
- Если исходный bullet уже содержит цифру, сохрани её и при необходимости усили результат.
- Если исходный bullet НЕ содержит цифру, но задача профессионально измерима, ОБЯЗАТЕЛЬНО добавь логическую inferred-метрику.
- Нельзя оставлять фразы "что повысило точность", "что ускорило процесс", "что упростило анализ", "что улучшило мониторинг" без числа, диапазона, срока, объёма или частоты.
- В metric-poor резюме минимум 60% bullets в каждом значимом месте работы должны содержать измеримость: проценты, сроки, объём, скорость, частота, SLA, время обработки, снижение ручной работы, количество сущностей, количество интеграций или диапазон.
- Каждый backend/dev bullet должен идти по схеме: действие + технический контекст + измеримый эффект.
- Если точной цифры нет, используй аккуратный диапазон: 10-15%, 15-20%, 20-30%, 30-40%, до 2 раз, на 1-2 дня, 1-2 недели, до 3-5 минут, до 1-2 часов.
- Для backend ролей логично измерять: сокращение ручных операций, ускорение формирования отчётов, снижение количества ошибок, повышение актуальности синхронизации, уменьшение времени подготовки документов, скорость обработки заявок, стабильность интеграций, наблюдаемость ошибок.
- Для API: количество модулей/контуров, снижение времени интеграции, стабильность обмена, уменьшение ручной сверки.
- Для складского учёта: сокращение ручного пересчёта, ускорение инвентаризации, снижение ошибок в остатках.
- Для отчётов: сокращение подготовки отчёта с часов до минут, ускорение агрегации, снижение ручной выгрузки.
- Для интеграций: синхронизация в течение 1-2 минут, снижение ручных проверок, мониторинг сбоев.
- Для LMS/B2B: снижение ручной координации, автоматизация уведомлений, сокращение времени формирования групп/документов.
- Не добавляй бизнес-KPI без опоры: выручку, ROI, CAC, LTV, бюджеты, миллионы пользователей.

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

function countMetrics(text: string) {
  const matches = text.match(/\d+(?:[.,]\d+)?\s*(?:%|сек|с\b|мин|час|дн|нед|мес|год|раз|x|тыс|млн|\+)?/giu);
  return matches?.length || 0;
}

function createExperiencePlanPrompt(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const items = parsed.experience?.items || [];
    const lines = items.map((item, index) => {
      const sourceIndex = typeof item.sourceIndex === "number" ? item.sourceIndex : index;
      const bulletTexts = (item.blocks || [])
        .filter((block) => block.type === "bullet" && block.text)
        .map((block) => block.text || "");
      const stackTexts = (item.blocks || [])
        .map((block) => block.text || "")
        .filter((text) => /^стек\s*:/iu.test(text.trim()))
        .map((text) => text.trim().replace(/\s+/g, " "));
      const sourceCount = bulletTexts.length;
      const metricsCount = countMetrics(bulletTexts.join("\n"));
      const metricPoor = sourceCount >= 3 && metricsCount < Math.ceil(sourceCount * 0.35);
      const minMetricBullets = metricPoor
        ? Math.max(2, Math.ceil(requiredMinBullets(sourceCount) * 0.6))
        : Math.max(1, Math.ceil(requiredMinBullets(sourceCount) * 0.35));
      const company = item.company?.name || "компания не указана";
      const position = item.position || "должность не указана";
      const dates = [item.dates?.start, item.dates?.end].filter(Boolean).join(" — ") || "даты не указаны";
      const stackNote = stackTexts.length
        ? `; стек: ${stackTexts.join(" / ")} — обязательно сохрани в focus`
        : "";
      return `- sourceIndex ${sourceIndex}: ${company}; ${position}; ${dates}; исходно ${sourceCount} bullets; найдено метрик: ${metricsCount}; ${metricPoor ? "МАЛО МЕТРИК — добавь inferred-метрики" : "метрики частично есть"}; верни минимум ${requiredMinBullets(sourceCount) || sourceCount || 1} adaptedBullets, из них минимум ${minMetricBullets} bullets с числами/диапазонами/сроками/объёмом${stackNote}`;
    });

    return lines.length ? `ОБЯЗАТЕЛЬНЫЙ ПЛАН ОПЫТА И МЕТРИК:\n${lines.join("\n")}` : "";
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

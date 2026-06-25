import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import { parseJsonFromModelResponse } from "../resume-adaptation/adaptation-generation/json-response.js";
import type {
  CoverLetterTone,
  GenerateCoverLetterParams,
  GenerateCoverLetterResult,
} from "./types.js";

const COVER_LETTER_RESUME_MAX_CHARS = 18_000;
const COVER_LETTER_VACANCY_MAX_CHARS = 18_000;
const COVER_LETTER_ADAPTATION_MAX_CHARS = 12_000;
const COVER_LETTER_MAX_TOKENS = 1_800;

export async function generateCoverLetter(
  params: GenerateCoverLetterParams
): Promise<GenerateCoverLetterResult> {
  const resumeForPrompt = params.resumeMarkdown
    .trim()
    .slice(0, COVER_LETTER_RESUME_MAX_CHARS);

  const vacancyForPrompt = params.vacancyText
    .trim()
    .slice(0, COVER_LETTER_VACANCY_MAX_CHARS);

  const adaptationForPrompt = params.adaptation
    ? JSON.stringify(params.adaptation).slice(0, COVER_LETTER_ADAPTATION_MAX_CHARS)
    : null;

  const aiProvider = getAiProvider();

  const messages: AiMessage[] = [
    {
      role: "system",
      content: createSystemPrompt(),
    },
    {
      role: "user",
      content: createUserPrompt({
        resumeMarkdown: resumeForPrompt,
        vacancyText: vacancyForPrompt,
        tone: params.tone,
        adaptationJson: adaptationForPrompt,
      }),
    },
  ];

  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0.18,
    maxTokens: COVER_LETTER_MAX_TOKENS,
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  const normalized = normalizeCoverLetterResult(parsedJson);

  return {
    coverLetter: normalizeFinalCoverLetter(normalized.coverLetter, params.tone),
    warnings: normalized.warnings,
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: {
      resumeChars: resumeForPrompt.length,
      vacancyChars: vacancyForPrompt.length,
      tone: params.tone,
      usedAdaptation: Boolean(params.adaptation),
    },
  };
}

function createSystemPrompt() {
  return `
Ты профессиональный карьерный редактор уровня senior-рекрутера.
Твоя задача — написать сопроводительное письмо, которое выглядит как сильный
деловой отклик реального кандидата, а не как шаблонный AI-текст.

Критически важные правила:
- Письмо ВСЕГДА должно начинаться ровно с: "Здравствуйте."
- Не используй "Здравствуйте!".
- Не добавляй тему письма.
- Не добавляй ФИО, телефон, email, Telegram и другие личные данные.
- Не выдумывай опыт, компании, должности, цифры, достижения, образование,
  английский, релокацию, стек или навыки.
- Используй только факты из резюме, адаптированного резюме и вакансии.
- Если факт не подтверждён, не превращай его в утверждение.
- Не пиши "идеально подхожу", "мои навыки будут полезны вашей команде",
  "являюсь отличным кандидатом", "динамично развивающаяся компания".
- Не пересказывай резюме целиком.
- Письмо должно показывать совпадение опыта кандидата с задачами вакансии.
- Каждый абзац должен нести смысл: роль, релевантный опыт, причина отклика,
  готовность обсудить.
- Если соответствие слабое, пиши честно и аккуратно, без искусственного усиления.
- Пиши на русском языке.
- Ответ должен быть строго JSON без markdown.

Формат JSON:
{
  "coverLetter": "Здравствуйте.\n\nтекст письма",
  "warnings": ["короткие предупреждения, если есть риск выдумывания или слабое совпадение"]
}
`.trim();
}

function createUserPrompt(params: {
  resumeMarkdown: string;
  vacancyText: string;
  tone: CoverLetterTone;
  adaptationJson: string | null;
}) {
  return `
Сгенерируй сопроводительное письмо для отклика на вакансию.

Тон письма:
${describeTone(params.tone)}

Структура и ограничения для выбранного тона:
${describeToneStructure(params.tone)}

Как думать перед написанием:
- Найди 2–4 самых сильных совпадения между резюме и вакансией.
- Выбери только подтверждённые факты.
- Сформулируй письмо как профессиональный отклик: конкретно, спокойно,
  без просьб "дать шанс" и без саморекламы.
- Не перечисляй стек через запятую без связи с задачами вакансии.
- Не добавляй достижения, которых нет в источниках.
- Не используй одинаковую структуру для разных тонов.

Резюме кандидата:
${params.resumeMarkdown}

Вакансия:
${params.vacancyText}

${
  params.adaptationJson
    ? `Адаптированное резюме / контекст адаптации:
${params.adaptationJson}`
    : "Адаптированного резюме нет. Используй только исходное резюме и вакансию."
}

Общие требования:
- Начни письмо ровно с: "Здравствуйте."
- Без темы письма.
- Без подписи с контактами.
- 1200–1700 символов для обычных тонов, если фактов достаточно.
- Если фактов мало, письмо должно быть короче, но не шаблоннее.
- В первом смысловом абзаце покажи, на какую роль откликается кандидат.
- В середине дай конкретное профессиональное совпадение с вакансией.
- В финале предложи обсудить опыт и задачи роли.
- Верни строго JSON.
`.trim();
}

function describeTone(tone: CoverLetterTone) {
  if (tone === "strict_professional") {
    return "Строгий профессиональный.";
  }

  if (tone === "friendly_neutral") {
    return "Дружелюбный нейтральный.";
  }

  return "Уверенный короткий.";
}

function describeToneStructure(tone: CoverLetterTone) {
  if (tone === "strict_professional") {
    return `
- 3 коротких абзаца после приветствия.
- Формальный деловой стиль без эмоций и разговорных оборотов.
- Не используй "я уверен", "буду рад", "спасибо за рассмотрение".
- Пиши как профессиональный рекрутерский отклик: роль, релевантный опыт,
  конкретное совпадение с задачами, готовность обсудить.
- Финал спокойный: "Готов обсудить опыт и задачи роли."
`.trim();
  }

  if (tone === "friendly_neutral") {
    return `
- 3 коротких абзаца после приветствия.
- Живой, человеческий, но профессиональный тон.
- Можно использовать "буду рад обсудить", но только один раз.
- Тон мягче строгого варианта, без фамильярности и без шуток.
- Допустимо начать с интереса к вакансии, если дальше сразу есть конкретика.
`.trim();
  }

  return `
- 1–2 коротких абзаца после приветствия.
- Максимум 700 символов без блока контактов.
- Без благодарностей, без длинного вступления, без "буду рад".
- Сразу к сути: роль, ключевое совпадение, готовность обсудить.
- Тон уверенный, но без самоуверенности и без фразы "я уверен".
`.trim();
}

function normalizeCoverLetterResult(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("Invalid cover letter response");
  }

  const coverLetter =
    typeof value.coverLetter === "string" ? value.coverLetter.trim() : "";

  if (!coverLetter) {
    throw new Error("AI returned empty cover letter");
  }

  const warnings = Array.isArray(value.warnings)
    ? value.warnings.filter((item): item is string => typeof item === "string")
    : [];

  return {
    coverLetter,
    warnings,
  };
}

function normalizeFinalCoverLetter(value: string, tone: CoverLetterTone) {
  const withoutGreeting = removeLeadingGreeting(value);
  const cleaned = cleanupForbiddenTonePhrases(withoutGreeting, tone).trim();

  return `Здравствуйте.\n\n${cleaned}`;
}

function removeLeadingGreeting(value: string) {
  return value
    .trim()
    .replace(/^здравствуйте[.!]?\s*/i, "")
    .replace(/^добрый\s+день[.!]?\s*/i, "")
    .trim();
}

function cleanupForbiddenTonePhrases(value: string, tone: CoverLetterTone) {
  if (tone !== "strict_professional" && tone !== "confident_short") {
    return value;
  }

  return value
    .replace(/я\s+уверен[а]?,?\s+что\s+/gi, "")
    .replace(/уверен[а]?,?\s+что\s+/gi, "")
    .replace(/спасибо\s+за\s+рассмотрение\s+моей\s+кандидатуры\.?/gi, "")
    .replace(/буду\s+рад[а]?\s+возможности\s+/gi, "Готов ")
    .replace(/буду\s+рад[а]?\s+обсудить/gi, "Готов обсудить")
    .replace(/мои\s+навыки\s+будут\s+полезны\s+вашей\s+команде\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
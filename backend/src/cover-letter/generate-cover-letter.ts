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
const COVER_LETTER_MAX_TOKENS = 1_500;

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
    temperature: 0.25,
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
Ты помогаешь кандидату написать сопроводительное письмо к вакансии.

Критически важные правила:
- Письмо ВСЕГДА должно начинаться ровно с: "Здравствуйте."
- Не используй "Здравствуйте!".
- Не выдумывай опыт, компании, должности, цифры, достижения, образование, английский, релокацию или навыки.
- Используй только факты, которые есть в резюме, адаптированном резюме или вакансии.
- Не добавляй ФИО, телефон, email и другие личные данные.
- Не пиши слишком длинно.
- Не используй канцелярит и пустые фразы.
- Не обещай того, чего нет в резюме.
- Не пиши "идеально подхожу".
- Не пиши одинаковые письма для разных тонов.
- Пиши на русском языке.
- Ответ должен быть строго JSON без markdown.

Формат JSON:
{
  "coverLetter": "Здравствуйте.\\n\\nтекст письма",
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
Сгенерируй сопроводительное письмо.

Тон письма:
${describeTone(params.tone)}

Структура и ограничения для выбранного тона:
${describeToneStructure(params.tone)}

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
- Не пересказывай всё резюме.
- Покажи, почему опыт кандидата релевантен именно этой вакансии.
- Если соответствие слабое, пиши аккуратно и не усиливай опыт искусственно.
- Не используй универсальные фразы вроде "мои навыки будут полезны вашей команде", если их можно заменить конкретикой.
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
- Формальный деловой стиль.
- Не используй "я уверен", "буду рад", "спасибо за рассмотрение".
- Пиши спокойно и конкретно: вакансия, релевантный опыт, готовность обсудить.
- Не добавляй эмоциональность.
`.trim();
  }

  if (tone === "friendly_neutral") {
    return `
- 3 коротких абзаца после приветствия.
- Живой, человеческий, но профессиональный тон.
- Можно использовать "буду рад обсудить".
- Пиши мягче, чем в строгом варианте, но без фамильярности.
- Можно начать с "Меня заинтересовала вакансия...", если это звучит естественно.
`.trim();
  }

  return `
- 1–2 коротких абзаца после приветствия.
- Максимум 650 символов без блока контактов.
- Без благодарностей, без длинного вступления, без "буду рад".
- Сразу к сути: роль, совпадение по стеку/опыту, готовность включиться.
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
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
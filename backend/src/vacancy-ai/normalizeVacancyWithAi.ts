import { getAiProvider } from "../ai/getAiProvider.js";
import type { AiMessage } from "../ai/types.js";
import type {
  NormalizedVacancy,
  VacancyNormalizationResult,
  VacancySourceMetadata,
} from "./types.js";

const VACANCY_MAX_TOKENS = Number(process.env.AI_VACANCY_MAX_TOKENS) || 3_500;

const SYSTEM_PROMPT = `
Ты строгий парсер вакансий для сервиса адаптации резюме.

Твоя задача:
1. Проверить, является ли текст описанием вакансии.
2. Если это не вакансия, вернуть isVacancy=false.
3. Если это вакансия, извлечь только факты из текста.
4. Очистить текст от UI-мусора, рекламы, похожих вакансий, статей, кнопок, форм, меню.
5. Ничего не выдумывать.
6. Не добавлять технологии, обязанности, требования или условия, которых нет в тексте.
7. Вернуть только валидный JSON без markdown, без пояснений, без текста вокруг.

Формат ответа строго:
{
  "isVacancy": true,
  "rejectionReason": null,
  "title": "string|null",
  "company": "string|null",
  "location": "string|null",
  "salary": "string|null",
  "employment": "string|null",
  "workFormat": "string|null",
  "schedule": "string|null",
  "seniority": "string|null",
  "summary": "string|null",
  "responsibilities": ["string"],
  "requirements": ["string"],
  "niceToHave": ["string"],
  "conditions": ["string"],
  "skills": ["string"],
  "warnings": ["string"],
  "confidence": 0.0
}

Если это не вакансия:
{
  "isVacancy": false,
  "rejectionReason": "короткая причина",
  "title": null,
  "company": null,
  "location": null,
  "salary": null,
  "employment": null,
  "workFormat": null,
  "schedule": null,
  "seniority": null,
  "summary": null,
  "responsibilities": [],
  "requirements": [],
  "niceToHave": [],
  "conditions": [],
  "skills": [],
  "warnings": [],
  "confidence": 0.0
}
`.trim();

export async function normalizeVacancyWithAi(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): Promise<VacancyNormalizationResult> {
  try {
    const aiProvider = getAiProvider();

    const messages: AiMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt(params.text, params.metadata),
      },
    ];

    const generationResult = await aiProvider.generateText({
      messages,
      temperature: 0,
      maxTokens: VACANCY_MAX_TOKENS,
    });

    const parsedJson = parseJsonFromModelResponse(generationResult.text);
    const vacancy = normalizeVacancy(parsedJson);

    return {
      ok: true,
      vacancy,
      rawResponse: generationResult.text,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    console.error("[vacancy-ai] Vacancy normalization failed", {
      error: errorMessage,
    });

    return {
      ok: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Не удалось надежно распознать вакансию. Вставьте полный текст вакансии вручную или попробуйте другую ссылку."
          : `AI не распознал вакансию: ${errorMessage}`,
    };
  }
}

function buildUserPrompt(text: string, metadata: VacancySourceMetadata) {
  return `
Источник:
${metadata.sourceUrl ? `sourceUrl: ${metadata.sourceUrl}` : ""}
${metadata.finalUrl ? `finalUrl: ${metadata.finalUrl}` : ""}
${metadata.title ? `pageTitle: ${metadata.title}` : ""}
${metadata.description ? `pageDescription: ${metadata.description}` : ""}
method: ${metadata.method}

Текст для анализа:
"""${text.slice(0, 25_000)}"""
`.trim();
}

function parseJsonFromModelResponse(response: string) {
  const withoutFence = response
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf("{");
    const lastBrace = withoutFence.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error(
        `No JSON object in model response. Raw response: ${withoutFence.slice(
          0,
          1500
        )}`
      );
    }

    try {
      return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error(
        `Invalid JSON in model response. Raw response: ${withoutFence.slice(
          0,
          1500
        )}`
      );
    }
  }
}

function normalizeVacancy(value: unknown): NormalizedVacancy {
  const source = isRecord(value) ? value : {};
  const isVacancy = source.isVacancy === true;

  return {
    isVacancy,
    rejectionReason: toNullableString(source.rejectionReason),

    title: isVacancy ? toNullableString(source.title) : null,
    company: isVacancy ? toNullableString(source.company) : null,
    location: isVacancy ? toNullableString(source.location) : null,
    salary: isVacancy ? toNullableString(source.salary) : null,
    employment: isVacancy ? toNullableString(source.employment) : null,
    workFormat: isVacancy ? toNullableString(source.workFormat) : null,
    schedule: isVacancy ? toNullableString(source.schedule) : null,
    seniority: isVacancy ? toNullableString(source.seniority) : null,

    summary: isVacancy ? toNullableString(source.summary) : null,
    responsibilities: isVacancy ? toStringArray(source.responsibilities) : [],
    requirements: isVacancy ? toStringArray(source.requirements) : [],
    niceToHave: isVacancy ? toStringArray(source.niceToHave) : [],
    conditions: isVacancy ? toStringArray(source.conditions) : [],
    skills: isVacancy ? toStringArray(source.skills) : [],

    warnings: toStringArray(source.warnings),
    confidence: toNullableNumber(source.confidence),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(1, value));
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item !== "string") {
        return "";
      }

      return item.trim();
    })
    .filter(Boolean)
    .slice(0, 30);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}
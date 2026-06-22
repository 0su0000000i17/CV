import { randomUUID } from "node:crypto";

import type {
  NormalizedVacancy,
  VacancyNormalizationResult,
  VacancySourceMetadata,
} from "./types.js";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

type GigaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

let cachedToken: CachedToken | null = null;

if (
  process.env.GIGACHAT_ALLOW_INSECURE_TLS === "true" &&
  process.env.NODE_ENV !== "production"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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

export async function normalizeVacancyWithGigaChat(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): Promise<VacancyNormalizationResult> {
  console.log("[vacancy-ai] normalize start", {
    method: params.metadata.method,
    sourceUrl: params.metadata.sourceUrl,
    finalUrl: params.metadata.finalUrl,
    textLength: params.text.length,
    provider: process.env.AI_PROVIDER,
    model: process.env.GIGACHAT_MODEL,
    hasAuthKey: Boolean(process.env.GIGACHAT_AUTH_KEY),
    authUrl: process.env.GIGACHAT_AUTH_URL,
    apiUrl: process.env.GIGACHAT_API_URL,
    insecureTls: process.env.GIGACHAT_ALLOW_INSECURE_TLS,
  });

  try {
    const rawResponse = await callGigaChat([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt(params.text, params.metadata),
      },
    ]);

    console.log("[vacancy-ai] raw model response received", {
      length: rawResponse.length,
      preview: rawResponse.slice(0, 300),
    });

    const parsedJson = parseJsonFromModelResponse(rawResponse);
    const vacancy = normalizeVacancy(parsedJson);

    console.log("[vacancy-ai] vacancy normalized", {
      isVacancy: vacancy.isVacancy,
      title: vacancy.title,
      company: vacancy.company,
      confidence: vacancy.confidence,
      responsibilitiesCount: vacancy.responsibilities.length,
      requirementsCount: vacancy.requirements.length,
      skillsCount: vacancy.skills.length,
    });

    return {
      ok: true,
      vacancy,
      rawResponse,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    console.error("[vacancy-ai] GigaChat normalization failed", {
      error: errorMessage,
    });

    return {
      ok: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Не удалось надежно распознать вакансию. Вставьте полный текст вакансии вручную или попробуйте другую ссылку."
          : `GigaChat не распознал вакансию: ${errorMessage}`,
    };
  }
}

async function callGigaChat(messages: GigaChatMessage[]) {
  const accessToken = await getGigaChatAccessToken();

  console.log("[vacancy-ai] calling GigaChat chat", {
    chatUrl: getChatCompletionUrl(),
    model: process.env.GIGACHAT_MODEL || "GigaChat",
    messagesCount: messages.length,
  });

  const response = await fetch(getChatCompletionUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: process.env.GIGACHAT_MODEL || "GigaChat",
      messages,
      temperature: 0,
      top_p: 0.1,
      max_tokens: 3500,
    }),
  });

  const responseText = await response.text();

  console.log("[vacancy-ai] GigaChat chat response", {
    status: response.status,
    ok: response.ok,
    bodyPreview: response.ok ? undefined : responseText.slice(0, 700),
  });

  if (!response.ok) {
    throw new Error(
      `GigaChat chat failed: ${response.status} ${responseText.slice(0, 1200)}`
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `GigaChat chat returned non-JSON: ${responseText.slice(0, 1200)}`
    );
  }

  const content = getMessageContent(data);

  if (!content) {
    throw new Error(
      `GigaChat returned empty content: ${responseText.slice(0, 1200)}`
    );
  }

  return content;
}

async function getGigaChatAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    console.log("[vacancy-ai] using cached GigaChat token");
    return cachedToken.accessToken;
  }

  console.log("[vacancy-ai] getting GigaChat token", {
    hasAuthKey: Boolean(process.env.GIGACHAT_AUTH_KEY),
    authUrl: getAuthUrl(),
    scope: process.env.GIGACHAT_SCOPE,
  });

  const authKey = process.env.GIGACHAT_AUTH_KEY;

  if (!authKey) {
    throw new Error("GIGACHAT_AUTH_KEY is not configured");
  }

  const response = await fetch(getAuthUrl(), {
    method: "POST",
    headers: {
      Authorization: `Basic ${authKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      RqUID: randomUUID(),
    },
    body: new URLSearchParams({
      scope: process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS",
    }),
  });

  const responseText = await response.text();

  console.log("[vacancy-ai] GigaChat auth response", {
    status: response.status,
    ok: response.ok,
    bodyPreview: response.ok ? undefined : responseText.slice(0, 700),
  });

  if (!response.ok) {
    throw new Error(
      `GigaChat auth failed: ${response.status} ${responseText.slice(0, 1200)}`
    );
  }

  let data: Record<string, unknown>;

  try {
    data = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error(
      `GigaChat auth returned non-JSON: ${responseText.slice(0, 1200)}`
    );
  }

  const accessToken = data.access_token;

  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error(
      `GigaChat auth returned empty access token: ${responseText.slice(0, 1200)}`
    );
  }

  cachedToken = {
    accessToken,
    expiresAt: getTokenExpiresAt(data),
  };

  console.log("[vacancy-ai] GigaChat token cached", {
    expiresAt: new Date(cachedToken.expiresAt).toISOString(),
  });

  return cachedToken.accessToken;
}

function getAuthUrl() {
  return (
    process.env.GIGACHAT_AUTH_URL ||
    "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
  );
}

function getApiUrl() {
  return (
    process.env.GIGACHAT_API_URL ||
    "https://gigachat.devices.sberbank.ru/api/v1"
  ).replace(/\/$/, "");
}

function getChatCompletionUrl() {
  return `${getApiUrl()}/chat/completions`;
}

function getTokenExpiresAt(data: Record<string, unknown>) {
  const expiresAt = data.expires_at;

  if (typeof expiresAt === "number") {
    return expiresAt > 10_000_000_000 ? expiresAt : expiresAt * 1000;
  }

  const expiresIn = data.expires_in;

  if (typeof expiresIn === "number") {
    return Date.now() + expiresIn * 1000;
  }

  return Date.now() + 25 * 60 * 1000;
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

function getMessageContent(data: unknown) {
  if (!isRecord(data)) {
    return null;
  }

  const choices = data.choices;

  if (!Array.isArray(choices)) {
    return null;
  }

  const firstChoice = choices[0];

  if (!isRecord(firstChoice)) {
    return null;
  }

  const message = firstChoice.message;

  if (!isRecord(message)) {
    return null;
  }

  const content = message.content;

  if (typeof content !== "string") {
    return null;
  }

  const trimmed = content.trim();

  return trimmed ? trimmed : null;
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
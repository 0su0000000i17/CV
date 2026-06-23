import { getAiProvider } from "../ai/getAiProvider.js";
import type { AiMessage } from "../ai/types.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/formatVacancyForAdaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import type {
  AdaptedResumeEducation,
  AdaptedResumeExperienceItem,
  AdaptedResumeSkills,
  ResumeAdaptationResult,
  ResumeAdaptationTarget,
  ResumeVacancyFitResult,
} from "./types.js";

type GenerateResumeAdaptationParams = {
  resumeMarkdown: string;
  vacancy: NormalizedVacancy;
  vacancyText?: string;
  fit: ResumeVacancyFitResult;
};

type GenerateResumeAdaptationOutput = {
  adaptation: ResumeAdaptationResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};

const ADAPT_MAX_TOKENS = Number(process.env.AI_ADAPT_MAX_TOKENS) || 4_500;
const ADAPT_RESUME_MAX_CHARS =
  Number(process.env.AI_ADAPT_RESUME_MAX_CHARS) || 18_000;
const ADAPT_VACANCY_MAX_CHARS =
  Number(process.env.AI_ADAPT_VACANCY_MAX_CHARS) || 12_000;

const SYSTEM_PROMPT = `
Ты карьерный редактор и эксперт по адаптации резюме под вакансию.

Твоя задача — создать адаптированную версию резюме под конкретную вакансию.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Нельзя выдумывать опыт.
2. Нельзя добавлять компании, должности, даты, проекты, технологии, метрики или обязанности, которых нет в резюме.
3. Нельзя менять ФИО, контакты, email, телефон, Telegram, ссылки, адрес, дату рождения, фото и другие личные данные.
4. Нельзя повышать уровень кандидата, если он не подтверждён резюме.
5. Нельзя превращать кандидата в другого специалиста.
6. Можно усиливать только то, что уже подтверждено резюме.
7. Можно использовать лексику вакансии только если она соответствует реальному опыту кандидата.
8. Если требование вакансии отсутствует в резюме, не добавляй его в резюме. Укажи его в skills.notAdded или warnings.

СТИЛЬ:
- Пиши как резюме для hh.ru / профессионального job board.
- Без маркетинговой воды.
- Без "идеальный кандидат", "эксперт мирового уровня", "уникальный специалист".
- Конкретно, делово, структурно.
- Сохраняй исходную логику резюме: заголовок, о себе, навыки, опыт, образование.
- Опыт работы должен оставаться по тем же компаниям/ролям/датам, которые есть в резюме.
- Можно переписать bullet points, но только на основе фактов из резюме.

ЧТО МОЖНО ДЕЛАТЬ:
- Переставить акценты под вакансию.
- Усилить summary.
- Перегруппировать навыки.
- Поднять релевантные навыки выше.
- Сделать описание опыта более релевантным вакансии.
- Убрать/понизить нерелевантный шум.
- Добавить более ясные формулировки на основе уже имеющихся фактов.

ЧТО НЕЛЬЗЯ ДЕЛАТЬ:
- Добавлять отсутствующий Node.js/backend production experience.
- Добавлять тестирование, Docker, CI/CD, GraphQL, Kubernetes и т.д., если этого нет в резюме.
- Придумывать новые метрики.
- Придумывать коммерческие результаты.
- Придумывать управление командой.
- Придумывать доменный опыт.

Верни строго валидный JSON без markdown и без текста вокруг.

Схема:
{
  "target": {
    "title": "string|null",
    "company": "string|null",
    "seniority": "string|null",
    "keywordsUsed": ["string"]
  },
  "adaptedResume": {
    "headline": "string",
    "summary": "string",
    "skills": {
      "primary": ["string"],
      "secondary": ["string"],
      "deprioritized": ["string"],
      "notAdded": ["string"]
    },
    "experience": [
      {
        "sourceIndex": 0,
        "company": "string|null",
        "position": "string|null",
        "dates": "string|null",
        "adaptedBullets": ["string"],
        "focus": "string|null",
        "preservedFacts": ["string"],
        "warnings": ["string"]
      }
    ],
    "education": {
      "policy": "unchanged|lightly_reordered|not_found",
      "notes": ["string"]
    },
    "additionalInfo": ["string"]
  },
  "changes": ["string"],
  "warnings": ["string"],
  "forbiddenClaims": ["string"]
}

ОГРАНИЧЕНИЯ:
- adaptedResume.skills.primary: максимум 12
- adaptedResume.skills.secondary: максимум 16
- experience: максимум 5 мест работы
- adaptedBullets на одно место работы: максимум 6
- changes: максимум 10
- warnings: максимум 10
- forbiddenClaims: максимум 12
`.trim();

export async function generateResumeAdaptation(
  params: GenerateResumeAdaptationParams
): Promise<GenerateResumeAdaptationOutput> {
  if (!params.fit.canAdapt || params.fit.adaptationMode === "blocked") {
    throw new Error("Resume vacancy fit is blocked");
  }

  const vacancyText =
    params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);

  const resumeForPrompt = params.resumeMarkdown
    .trim()
    .slice(0, ADAPT_RESUME_MAX_CHARS);

  const vacancyForPrompt = vacancyText.trim().slice(0, ADAPT_VACANCY_MAX_CHARS);

  const aiProvider = getAiProvider();

  const messages: AiMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: createUserPrompt({
        resumeMarkdown: resumeForPrompt,
        vacancyText: vacancyForPrompt,
        fit: params.fit,
      }),
    },
  ];

  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0,
    maxTokens: ADAPT_MAX_TOKENS,
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  const adaptation = normalizeAdaptationResult(parsedJson);

  return {
    adaptation,
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: {
      resumeChars: resumeForPrompt.length,
      vacancyChars: vacancyForPrompt.length,
    },
  };
}

function createUserPrompt(params: {
  resumeMarkdown: string;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
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

Создай адаптированную structured-версию резюме под вакансию.

Помни:
- если в fit.gaps или fit.blockingGaps указаны отсутствующие навыки, не добавляй их как будто кандидат ими владеет;
- если adaptationMode = "limited", адаптируй осторожно и явно укажи ограничения в warnings;
- контакты и личные данные не трогай;
- верни только JSON.
`.trim();
}

function parseJsonFromModelResponse(response: string) {
  const normalized = response
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized) as unknown;
  } catch {
    const balancedJson = extractBalancedJsonObject(normalized);

    if (!balancedJson) {
      throw new Error(
        `No JSON object in AI adaptation response. Raw response: ${normalized.slice(
          0,
          1500
        )}`
      );
    }

    try {
      return JSON.parse(balancedJson) as unknown;
    } catch {
      throw new Error(
        `Invalid JSON in AI adaptation response. Raw response: ${normalized.slice(
          0,
          1500
        )}`
      );
    }
  }
}

function extractBalancedJsonObject(text: string) {
  const firstBraceIndex = text.indexOf("{");

  if (firstBraceIndex === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = firstBraceIndex; index < text.length; index += 1) {
    const char = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(firstBraceIndex, index + 1).trim();
      }
    }
  }

  return null;
}

function normalizeAdaptationResult(value: unknown): ResumeAdaptationResult {
  const source = isRecord(value) ? value : {};
  const adaptedResume = isRecord(source.adaptedResume)
    ? source.adaptedResume
    : {};

  return {
    target: normalizeTarget(source.target),
    adaptedResume: {
      headline:
        toNullableString(adaptedResume.headline) ||
        "Адаптированное резюме",
      summary: toNullableString(adaptedResume.summary) || "",
      skills: normalizeSkills(adaptedResume.skills),
      experience: normalizeExperience(adaptedResume.experience),
      education: normalizeEducation(adaptedResume.education),
      additionalInfo: toStringArray(adaptedResume.additionalInfo, 10),
    },
    changes: toStringArray(source.changes, 10),
    warnings: toStringArray(source.warnings, 10),
    forbiddenClaims: normalizeForbiddenClaims(source.forbiddenClaims),
  };
}

function normalizeTarget(value: unknown): ResumeAdaptationTarget {
  const source = isRecord(value) ? value : {};

  return {
    title: toNullableString(source.title),
    company: toNullableString(source.company),
    seniority: toNullableString(source.seniority),
    keywordsUsed: toStringArray(source.keywordsUsed, 20),
  };
}

function normalizeSkills(value: unknown): AdaptedResumeSkills {
  const source = isRecord(value) ? value : {};

  return {
    primary: toStringArray(source.primary, 12),
    secondary: toStringArray(source.secondary, 16),
    deprioritized: toStringArray(source.deprioritized, 12),
    notAdded: toStringArray(source.notAdded, 12),
  };
}

function normalizeExperience(value: unknown): AdaptedResumeExperienceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        sourceIndex:
          typeof item.sourceIndex === "number" && Number.isFinite(item.sourceIndex)
            ? item.sourceIndex
            : index,
        company: toNullableString(item.company),
        position: toNullableString(item.position),
        dates: toNullableString(item.dates),
        adaptedBullets: toStringArray(item.adaptedBullets, 6),
        focus: toNullableString(item.focus),
        preservedFacts: toStringArray(item.preservedFacts, 8),
        warnings: toStringArray(item.warnings, 6),
      };
    })
    .filter((item): item is AdaptedResumeExperienceItem => Boolean(item))
    .slice(0, 5);
}

function normalizeEducation(value: unknown): AdaptedResumeEducation {
  const source = isRecord(value) ? value : {};
  const policy = source.policy;

  return {
    policy:
      policy === "unchanged" ||
      policy === "lightly_reordered" ||
      policy === "not_found"
        ? policy
        : "unchanged",
    notes: toStringArray(source.notes, 6),
  };
}

function normalizeForbiddenClaims(value: unknown) {
  return Array.from(
    new Set([
      ...toStringArray(value, 12),
      "Не добавлены навыки, технологии, должности, компании, даты и метрики, которых нет в исходном резюме.",
      "Контакты и личные данные не изменялись.",
    ])
  );
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function toStringArray(value: unknown, limit: number) {
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
    .slice(0, limit);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
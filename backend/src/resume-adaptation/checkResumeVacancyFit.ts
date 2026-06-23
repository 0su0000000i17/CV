import { getAiProvider } from "../ai/getAiProvider.js";
import type { AiGenerateTextResult, AiMessage } from "../ai/types.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/formatVacancyForAdaptation.js";
import type {
  ResumeVacancyAdaptationMode,
  ResumeVacancyCareerMove,
  ResumeVacancyFitLevel,
  ResumeVacancyFitResult,
  ResumeVacancyFitRiskFlag,
} from "./types.js";

type CheckResumeVacancyFitParams = {
  resumeMarkdown: string;
  vacancy: NormalizedVacancy;
  vacancyText?: string;
};

type CheckResumeVacancyFitOutput = {
  fit: ResumeVacancyFitResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};

const FIT_MAX_TOKENS = Number(process.env.AI_FIT_MAX_TOKENS) || 2_500;
const FIT_RESUME_MAX_CHARS =
  Number(process.env.AI_FIT_RESUME_MAX_CHARS) || 18_000;
const FIT_VACANCY_MAX_CHARS =
  Number(process.env.AI_FIT_VACANCY_MAX_CHARS) || 12_000;

const fitLevels: ResumeVacancyFitLevel[] = [
  "impossible",
  "weak",
  "partial",
  "solid",
  "strong",
];

const careerMoves: ResumeVacancyCareerMove[] = [
  "same_role",
  "adjacent_role",
  "stretch_role",
  "career_change",
  "unknown",
];

const adaptationModes: ResumeVacancyAdaptationMode[] = [
  "safe",
  "limited",
  "blocked",
];

const riskFlagTypes: ResumeVacancyFitRiskFlag["type"][] = [
  "role_mismatch",
  "missing_core_experience",
  "missing_required_skill",
  "level_mismatch",
  "domain_mismatch",
  "weak_evidence",
  "career_change",
  "over_adaptation_risk",
];

const riskFlagSeverities: ResumeVacancyFitRiskFlag["severity"][] = [
  "minor",
  "major",
  "critical",
];

const SYSTEM_PROMPT = `
Ты строгий карьерный аналитик и эксперт по адаптации резюме.

Твоя задача — проверить, можно ли адаптировать резюме кандидата под вакансию без выдумывания опыта.

ВАЖНО:
- Ты НЕ адаптируешь резюме сейчас.
- Ты только проверяешь совместимость резюме и вакансии.
- Нельзя выдумывать опыт, компании, должности, годы, проекты, стек, метрики или доменную экспертизу.
- Нельзя превращать кандидата в другого специалиста.
- Можно учитывать смежные роли, если в резюме есть реальные подтверждения.

ПРАВИЛА СОВМЕСТИМОСТИ:
1. same_role:
   Резюме и вакансия относятся к одной роли.
   Пример: Frontend → React Frontend.

2. adjacent_role:
   Роли смежные, адаптация возможна без выдумывания.
   Пример: Frontend React → Fullstack React + Node.js, если в резюме есть JS/TS, API, Node.js, backend, Express/Nest, БД или другая backend-evidence.
   Пример: Manual QA → QA Automation, если есть код, автотесты, Selenium/Playwright/Cypress/Jest/Python/Java.

3. stretch_role:
   Роль близкая, но есть существенные пробелы.
   Адаптация возможна только limited: можно усилить подтверждённый опыт, но нельзя добавлять отсутствующее ядро вакансии.

4. career_change:
   Роль другая. Если адаптация потребует выдумывания профессионального опыта — blocked.
   Пример: Frontend → Повар, Backend → Врач, SMM → Senior Java Developer без Java experience.

5. impossible:
   Резюме почти не связано с вакансией. canAdapt=false.

FULLSTACK-ПРАВИЛО:
- Frontend → Fullstack React/Node не блокируй автоматически.
- Если в вакансии есть React/Frontend как значимая часть, а в резюме есть сильный React/TS опыт, это минимум partial.
- Если Node.js/backend в резюме не подтверждён, укажи gap/blockingGap и запрети выдумывать backend production experience.
- Если вакансия backend-heavy, а резюме только frontend без backend evidence — fit weak или impossible.

УРОВЕНЬ:
- Не повышай уровень кандидата.
- Если вакансия Senior, а в резюме нет явного Senior/Lead или сильных подтверждений масштаба, добавь level_mismatch.
- Но не блокируй автоматически, если стек и опыт релевантны.

Ответ должен быть строго валидным JSON без markdown.

Схема:
{
  "canAdapt": true,
  "fit": "impossible|weak|partial|solid|strong",
  "score": 0,
  "confidence": 0.0,
  "resumeRole": "string|null",
  "vacancyRole": "string|null",
  "careerMove": "same_role|adjacent_role|stretch_role|career_change|unknown",
  "adaptationMode": "safe|limited|blocked",
  "reason": "string",
  "safeAdaptationDirection": "string|null",
  "matchedRequirements": ["string"],
  "transferableExperience": ["string"],
  "gaps": ["string"],
  "blockingGaps": ["string"],
  "allowedChanges": ["string"],
  "forbiddenChanges": ["string"],
  "riskFlags": [
    {
      "type": "role_mismatch|missing_core_experience|missing_required_skill|level_mismatch|domain_mismatch|weak_evidence|career_change|over_adaptation_risk",
      "severity": "minor|major|critical",
      "explanation": "string"
    }
  ]
}

score:
- impossible: 0-20
- weak: 21-45
- partial: 46-65
- solid: 66-85
- strong: 86-100

canAdapt:
- true только если адаптация возможна без выдумывания опыта.
- false если нужно придумать core experience, которого нет в резюме.
`.trim();

export async function checkResumeVacancyFit(
  params: CheckResumeVacancyFitParams
): Promise<CheckResumeVacancyFitOutput> {
  const vacancyText =
    params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);

  const resumeForPrompt = params.resumeMarkdown
    .trim()
    .slice(0, FIT_RESUME_MAX_CHARS);

  const vacancyForPrompt = vacancyText.trim().slice(0, FIT_VACANCY_MAX_CHARS);

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
      }),
    },
  ];

  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0,
    maxTokens: FIT_MAX_TOKENS,
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  const fit = normalizeFitResult(parsedJson);

  return {
    fit,
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

Проверь совместимость резюме и вакансии.
Верни только JSON по схеме из system prompt.
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
        `No JSON object in AI fit response. Raw response: ${normalized.slice(
          0,
          1500
        )}`
      );
    }

    try {
      return JSON.parse(balancedJson) as unknown;
    } catch {
      throw new Error(
        `Invalid JSON in AI fit response. Raw response: ${normalized.slice(
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

function normalizeFitResult(value: unknown): ResumeVacancyFitResult {
  const source = isRecord(value) ? value : {};

  const fit = toEnumValue(source.fit, fitLevels, "impossible");
  const adaptationMode = toEnumValue(
    source.adaptationMode,
    adaptationModes,
    fit === "impossible" ? "blocked" : "limited"
  );

  const score = normalizeScore(source.score, fit);
  const confidence = normalizeConfidence(source.confidence);

  const matchedRequirements = toStringArray(source.matchedRequirements, 12);
  const transferableExperience = toStringArray(
    source.transferableExperience,
    12
  );
  const gaps = toStringArray(source.gaps, 12);
  const blockingGaps = toStringArray(source.blockingGaps, 10);

  const backendCanAdapt = getBackendCanAdapt({
    rawCanAdapt: source.canAdapt,
    fit,
    adaptationMode,
    matchedRequirements,
    transferableExperience,
    blockingGaps,
  });

  return {
    canAdapt: backendCanAdapt,
    fit,
    score,
    confidence,

    resumeRole: toNullableString(source.resumeRole),
    vacancyRole: toNullableString(source.vacancyRole),
    careerMove: toEnumValue(source.careerMove, careerMoves, "unknown"),
    adaptationMode: backendCanAdapt ? adaptationMode : "blocked",

    reason:
      toNullableString(source.reason) ||
      "Не удалось надёжно объяснить совместимость резюме и вакансии.",
    safeAdaptationDirection: backendCanAdapt
      ? toNullableString(source.safeAdaptationDirection)
      : null,

    matchedRequirements,
    transferableExperience,
    gaps,
    blockingGaps,

    allowedChanges: toStringArray(source.allowedChanges, 12),
    forbiddenChanges: normalizeForbiddenChanges(source.forbiddenChanges),

    riskFlags: normalizeRiskFlags(source.riskFlags),
  };
}

function getBackendCanAdapt(params: {
  rawCanAdapt: unknown;
  fit: ResumeVacancyFitLevel;
  adaptationMode: ResumeVacancyAdaptationMode;
  matchedRequirements: string[];
  transferableExperience: string[];
  blockingGaps: string[];
}) {
  if (params.fit === "impossible" || params.adaptationMode === "blocked") {
    return false;
  }

  if (params.rawCanAdapt !== true) {
    return false;
  }

  if (
    params.fit === "weak" &&
    params.matchedRequirements.length === 0 &&
    params.transferableExperience.length === 0
  ) {
    return false;
  }

  if (params.blockingGaps.length >= 4 && params.fit !== "partial") {
    return false;
  }

  return true;
}

function normalizeForbiddenChanges(value: unknown) {
  const modelItems = toStringArray(value, 12);

  return Array.from(
    new Set([
      ...modelItems,
      "Не менять ФИО, контакты, email, телефон, Telegram, ссылки, адрес и другие личные данные.",
      "Не добавлять компании, должности, даты, проекты, технологии и метрики, которых нет в резюме.",
      "Не повышать уровень кандидата, если он не подтверждён резюме.",
    ])
  );
}

function normalizeRiskFlags(value: unknown): ResumeVacancyFitRiskFlag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const explanation = toNullableString(item.explanation);

      if (!explanation) {
        return null;
      }

      return {
        type: toEnumValue(item.type, riskFlagTypes, "over_adaptation_risk"),
        severity: toEnumValue(item.severity, riskFlagSeverities, "minor"),
        explanation,
      };
    })
    .filter((item): item is ResumeVacancyFitRiskFlag => Boolean(item))
    .slice(0, 8);
}

function normalizeScore(value: unknown, fit: ResumeVacancyFitLevel) {
  const fallbackByFit: Record<ResumeVacancyFitLevel, number> = {
    impossible: 10,
    weak: 35,
    partial: 55,
    solid: 75,
    strong: 90,
  };

  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallbackByFit[fit];
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, value));
}

function toEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string") {
    return fallback;
  }

  if (allowedValues.includes(value as T)) {
    return value as T;
  }

  return fallback;
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
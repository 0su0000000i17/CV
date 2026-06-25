import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import { parseJsonFromModelResponse } from "../resume-adaptation/adaptation-generation/json-response.js";
import { splitResumeIntoSections } from "./sections.js";
import { cleanLine, normalizeCompanyUrl } from "./text-utils.js";
import type {
  EditableResumeExperienceItem,
  EditableResumeJson,
} from "./types.js";

const MAX_PROFESSIONAL_TEXT_CHARS = 32_000;
const MAX_TOKENS = 5_500;

type AiEditableResumeResult = {
  resume: EditableResumeJson;
  generation: {
    provider: string;
    model: string;
  };
};

export async function extractEditableResumeWithAi(
  markdown: string
): Promise<AiEditableResumeResult> {
  const aiProvider = getAiProvider();
  const professionalText = buildProfessionalResumeText(markdown);

  const messages: AiMessage[] = [
    {
      role: "system",
      content: createSystemPrompt(),
    },
    {
      role: "user",
      content: createUserPrompt(professionalText),
    },
  ];

  const generation = await aiProvider.generateText({
    messages,
    temperature: 0.05,
    maxTokens: MAX_TOKENS,
  });

  const parsedJson = parseJsonFromModelResponse(generation.text);

  return {
    resume: normalizeEditableResumeJson(parsedJson),
    generation: {
      provider: generation.provider,
      model: generation.model,
    },
  };
}

function buildProfessionalResumeText(markdown: string) {
  const sections = splitResumeIntoSections(markdown);

  return [
    "Желаемая должность и зарплата",
    ...sections.target,
    "",
    "Опыт работы",
    ...sections.experience,
    "",
    "Образование",
    ...sections.education,
    "",
    "Навыки",
    ...sections.skills,
    "",
    "Дополнительная информация",
    ...sections.additionalInfo,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, MAX_PROFESSIONAL_TEXT_CHARS)
    .trim();
}

function createSystemPrompt() {
  return `
Ты универсальный extractor резюме. Твоя задача — превратить профессиональную часть резюме в structured JSON для редактора.

Важно:
- Резюме может быть для любой профессии: разработчик, SMM, маркетолог, дизайнер, менеджер, юрист, бухгалтер, инженер, врач и т.д.
- Не используй списки известных профессий, компаний или навыков.
- Не выдумывай факты.
- Не улучши текст и не адаптируй под вакансию.
- Не оценивай кандидата.
- Не добавляй навыки, компании, должности, даты, образование или достижения, которых нет в тексте.
- Сохраняй смысл и конкретику исходного резюме.
- Если поле не найдено — верни null или пустой массив.
- Если структура опыта неоднозначная, не теряй текст: клади его в focus или adaptedBullets.
- Контактов, ФИО, телефона, email, города проживания, даты рождения в тексте быть не должно. Если встретились случайно — не возвращай их.
- Ответ строго JSON без markdown.

JSON schema:
{
  "target": {
    "title": "string|null",
    "company": null,
    "seniority": "string|null",
    "keywordsUsed": []
  },
  "adaptedResume": {
    "headline": "string",
    "summary": "string",
    "skills": {
      "primary": ["string"],
      "secondary": [],
      "deprioritized": [],
      "notAdded": []
    },
    "experience": [
      {
        "sourceIndex": 0,
        "company": "string|null",
        "companyUrl": "string|null",
        "position": "string|null",
        "dates": "string|null",
        "focus": "string|null",
        "adaptedBullets": ["string"],
        "preservedFacts": [],
        "warnings": []
      }
    ],
    "education": {
      "policy": "unchanged|not_found",
      "notes": ["string"]
    },
    "additionalInfo": ["string"]
  },
  "changes": [],
  "warnings": [],
  "forbiddenClaims": []
}
`.trim();
}

function createUserPrompt(professionalText: string) {
  return `
Извлеки structured JSON из профессиональной части резюме.

Правила для опыта:
- Один элемент experience = одно место работы / один проектный период / одна роль.
- company — название организации или проекта, если оно явно указано.
- companyUrl — сайт компании, только если это именно сайт работодателя. Не возвращай career/job/vacancy страницы.
- position — должность/роль кандидата.
- dates — период работы как в исходном тексте.
- focus — короткое описание роли, проекта или контекста, если оно есть до списка обязанностей.
- adaptedBullets — обязанности, достижения, результаты, вклад, задачи. Каждый пункт отдельной строкой.
- preservedFacts и warnings оставляй пустыми массивами.

Правила для навыков:
- Извлекай любые навыки из резюме, не только IT.
- Сохраняй исходные названия навыков.
- Не склеивай разные навыки в один пункт.
- Не дели устойчивые навыки вроде "REST API", "RTK Query", "React hooks", если они в тексте идут как единое понятие.

Правила для образования:
- Не дублируй одинаковые строки.
- Если есть уровень и университет, сохрани оба, но без повторов.

Профессиональная часть резюме:
${professionalText}

Верни строго JSON.
`.trim();
}

function normalizeEditableResumeJson(value: unknown): EditableResumeJson {
  if (!isRecord(value)) {
    throw new Error("AI editable resume extractor returned non-object JSON");
  }

  const adaptedResume = isRecord(value.adaptedResume)
    ? value.adaptedResume
    : {};
  const target = isRecord(value.target) ? value.target : {};
  const skills = isRecord(adaptedResume.skills) ? adaptedResume.skills : {};
  const education = isRecord(adaptedResume.education)
    ? adaptedResume.education
    : {};

  const headline =
    readString(adaptedResume.headline) ||
    readString(target.title) ||
    "Резюме";

  return {
    target: {
      title: readNullableString(target.title) || headline,
      company: null,
      seniority: readNullableString(target.seniority),
      keywordsUsed: readStringArray(target.keywordsUsed),
    },
    adaptedResume: {
      headline,
      summary: readString(adaptedResume.summary),
      skills: {
        primary: dedupe(readStringArray(skills.primary)),
        secondary: dedupe(readStringArray(skills.secondary)),
        deprioritized: dedupe(readStringArray(skills.deprioritized)),
        notAdded: dedupe(readStringArray(skills.notAdded)),
      },
      experience: normalizeExperience(adaptedResume.experience),
      education: {
        policy: readString(education.policy) === "not_found"
          ? "not_found"
          : "unchanged",
        notes: dedupe(readStringArray(education.notes)),
      },
      additionalInfo: dedupe(readStringArray(adaptedResume.additionalInfo)),
    },
    changes: [],
    warnings: readStringArray(value.warnings),
    forbiddenClaims: readStringArray(value.forbiddenClaims),
  };
}

function normalizeExperience(value: unknown): EditableResumeExperienceItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const record = isRecord(item) ? item : {};

      return {
        sourceIndex: Number.isFinite(Number(record.sourceIndex))
          ? Number(record.sourceIndex)
          : index,
        company: readNullableString(record.company),
        companyUrl: normalizeCompanyUrl(readNullableString(record.companyUrl)),
        position: readNullableString(record.position),
        dates: readNullableString(record.dates),
        focus: readNullableString(record.focus),
        adaptedBullets: dedupe(readStringArray(record.adaptedBullets)),
        preservedFacts: [],
        warnings: readStringArray(record.warnings),
      };
    })
    .filter((item) => {
      return item.company || item.position || item.adaptedBullets.length;
    });
}

function readString(value: unknown) {
  return typeof value === "string" ? cleanLine(value) : "";
}

function readNullableString(value: unknown) {
  const text = readString(value);

  return text || null;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map(readString).filter(Boolean);
}

function dedupe(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = item.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
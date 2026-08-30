import type { CoverLetterTone } from "../types.js";
import { describeTone, describeToneStructure } from "./tone.js";

export function createCoverLetterUserPrompt(params: {
  resumeMarkdown: string;
  vacancyText: string;
  tone: CoverLetterTone;
  adaptationJson: string | null;
}) {
  return `
Сгенерируй сопроводительное письмо для отклика на вакансию.

Тон письма: ${describeTone(params.tone)}
Структура и ограничения:
${describeToneStructure(params.tone)}

Перед написанием:
- Найди 2-4 самых сильных совпадения между резюме и вакансией.
- Выбери только подтверждённые факты.
- Пиши конкретно и спокойно, без просьб "дать шанс" и саморекламы.
- Первый абзац свяжи с конкретной вакансией, не с общей заготовкой.
- В середине покажи связь опыта кандидата с задачами вакансии.
- Не перечисляй стек без связи с задачами и не выдумывай достижения.

<resume>
${params.resumeMarkdown}
</resume>

<vacancy>
${params.vacancyText}
</vacancy>

${params.adaptationJson ? `<adaptation>
${params.adaptationJson}
</adaptation>` : "Адаптированного резюме нет. Используй только исходное резюме и вакансию."}

Общие требования:
- Начни ровно с "Здравствуйте.", без темы и подписи с контактами.
- 1200-1700 символов для обычных тонов, если фактов достаточно.
- Если фактов мало, письмо короче, но не шаблоннее.
- В первом смысловом абзаце назови роль.
- В середине дай конкретное профессиональное совпадение.
- В финале предложи обсудить опыт и задачи роли.
- Верни строго JSON.
`.trim();
}

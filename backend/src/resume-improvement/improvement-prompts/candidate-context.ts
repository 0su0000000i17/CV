import { extractMetricTokens } from "../../utils/metric-text.js";
import type { ResumePromptPayload } from "./types.js";

export function createGenderInstruction(resumeMarkdown: string) {
  try {
    const gender = (JSON.parse(resumeMarkdown) as ResumePromptPayload).personal?.gender?.trim();
    if (/женщина/i.test(gender || "")) {
      return "ПОЛ КАНДИДАТА: Женщина. Пиши опыт, summary и focus в женском роде. Нельзя использовать мужские формы.";
    }
    if (/мужчина/i.test(gender || "")) {
      return "ПОЛ КАНДИДАТА: Мужчина. Пиши опыт, summary и focus в мужском роде.";
    }
  } catch {
    return unknownGenderInstruction();
  }
  return unknownGenderInstruction();
}

function unknownGenderInstruction() {
  return "ПОЛ КАНДИДАТА: не указан. Используй нейтральные формулировки.";
}

export function createSummaryEvidenceBlock(resumeMarkdown: string) {
  try {
    const parsed = JSON.parse(resumeMarkdown) as ResumePromptPayload;
    const anchors = (parsed.additional?.about || [])
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter((item) => item && extractMetricTokens(item).length > 0)
      .slice(0, 3);
    if (!anchors.length) return "";
    return `
ОПОРЫ ИСХОДНОГО SUMMARY:
${anchors.map((item) => `- ${item}`).join("\n")}
Это уже подтверждённые сильные доказательства из «Обо мне». Сохрани их метрики в новом summary
в естественной форме. Не заменяй конкретное доказательство общими словами и не переноси его только
в опыт: summary должен оставить рекрутеру хотя бы тот же уровень доказательности.
`.trim();
  } catch {
    return "";
  }
}

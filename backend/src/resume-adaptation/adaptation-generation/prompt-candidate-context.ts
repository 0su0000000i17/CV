import type { ResumeVacancyFitResult } from "../types.js";
import { parseSourceResumeForCounts } from "./prompt-volume.js";

export function createGenderPrompt(resumeMarkdown: string) {
  try {
    const gender = parseSourceResumeForCounts(resumeMarkdown).personal?.gender || "";
    if (/женщина/iu.test(gender)) {
      return `
ПОЛ КАНДИДАТА: Женщина.
Пиши опыт, summary и focus в женском роде. Нельзя: разработал, подготовил, проводил, создавал, координировал, анализировал, внедрил. Нужно: разработала, подготовила, проводила, создавала, координировала, анализировала, внедрила.
`.trim();
    }
    if (/мужчина/iu.test(gender)) {
      return "ПОЛ КАНДИДАТА: Мужчина. Пиши опыт, summary и focus в мужском роде.";
    }
  } catch {
    return unknownGenderPrompt();
  }
  return unknownGenderPrompt();
}

function unknownGenderPrompt() {
  return "ПОЛ КАНДИДАТА: не указан. Используй нейтральные формулировки без мужского рода по умолчанию.";
}

function isGenericForbiddenChange(value: string) {
  return (
    /личные\s+данные|контакты/iu.test(value) ||
    /не\s+повышать\s+уровень/iu.test(value) ||
    /компании,\s*должности,\s*даты,\s*проекты,\s*технологии\s+и\s+метрики/iu.test(value)
  );
}

export function createAdaptationFitPrompt(fit: ResumeVacancyFitResult) {
  return JSON.stringify(
    {
      ...fit,
      forbiddenChanges: fit.forbiddenChanges.filter((item) => !isGenericForbiddenChange(item)),
      note:
        "Fit является подсказкой, а не запретом на усиление формулировок. Прямой источник истины — резюме кандидата. Любые цифры в bullets должны дословно совпадать с исходным резюме — не добавляй новых чисел.",
    },
    null,
    2
  );
}

import type {
  ResumeAnalysis,
  ResumeRedFlagType,
} from "../../schemas/resume-analysis-schema.js";
import { addUnique, cleanList } from "./list-utils.js";

function hasFlag(analysis: ResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

export function getWeaknesses(analysis: ResumeAnalysis) {
  const items = cleanList(analysis.weaknesses);

  if (analysis.sections.evidence < 70 || hasFlag(analysis, "weak_evidence")) {
    addUnique(
      items,
      "Недостаточно доказательств результата: мало метрик, масштаба задач и конкретного влияния на продукт."
    );
  }

  if (analysis.sections.scanability < 70 || hasFlag(analysis, "low_scanability")) {
    addUnique(
      items,
      "Профиль резюме стоит раскрыть точнее: показать опыт достаточно подробно для уровня кандидата, но без лишней перегрузки."
    );
  }

  if (analysis.sections.ats < 85) {
    addUnique(
      items,
      "ATS-блок можно усилить: часть ключевых слов, стеков и формулировок роли раскрыта недостаточно точно."
    );
  }

  return items.slice(0, 8);
}

export function getAtsIssues(analysis: ResumeAnalysis) {
  const items = cleanList(analysis.atsIssues);

  if (analysis.sections.ats < 85) {
    addUnique(
      items,
      "Недостаточно точное ATS-позиционирование: стоит добавить больше ключевых слов из целевой роли."
    );
  }

  if (analysis.sections.scanability < 70) {
    addUnique(
      items,
      "Структура усложняет первичный просмотр: важные технологии и результаты лучше вынести ближе к началу блоков."
    );
  }

  if (analysis.missingKeywords.length && analysis.sections.ats < 90) {
    addUnique(
      items,
      "В резюме не хватает части ключевых слов, которые могут быть важны для первичного фильтра."
    );
  }

  return items.slice(0, 8);
}

export function getRecommendations(analysis: ResumeAnalysis) {
  const items = cleanList(analysis.recommendations);

  if (analysis.sections.evidence < 70) {
    addUnique(
      items,
      "Добавить к каждому месту работы 2–3 результата с цифрами: нагрузка, сроки, процент улучшений, объём данных или бизнес-эффект."
    );
  }

  if (analysis.sections.scanability < 70) {
    addUnique(
      items,
      "Выстроить опыт по золотой середине: убрать лишние повторы, но оставить достаточно деталей по задачам, стеку и результатам."
    );
  }

  if (analysis.sections.ats < 85) {
    addUnique(
      items,
      "Добавить стек и ключевые формулировки из целевых вакансий в опыт, а не только в список навыков."
    );
  }

  return items.slice(0, 8);
}

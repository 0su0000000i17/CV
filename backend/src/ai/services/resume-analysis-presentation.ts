import type {
  ResumeAnalysis,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../schemas/resume-analysis-schema.js";

const EMPTY_PATTERN =
  /^(нет|нет проблем|нет явных проблем|не выявлено|отсутствуют|none|n\/a|-|—)$/i;

const flagText: Record<ResumeRedFlagType, string> = {
  role_mismatch:
    "Заявленная роль не полностью подтверждается последними должностями или содержанием опыта.",
  inflated_level:
    "Заявленный уровень выглядит выше, чем подтверждают задачи, ответственность и результаты.",
  career_transition:
    "В резюме видна переходная траектория, поэтому релевантность опыта нужно объяснить сильнее.",
  weak_evidence:
    "Опыт описан без достаточного количества измеримых результатов, масштаба задач и влияния на продукт.",
  generic_responsibilities:
    "Часть опыта выглядит как список обязанностей без конкретных достижений и результата.",
  keyword_stuffing:
    "Блок навыков перегружен технологиями, но не все они явно подтверждены в опыте.",
  poor_ats:
    "Резюме можно усилить под ATS: добавить более точные ключевые слова, стек и формулировки роли.",
  unclear_positioning:
    "Позиционирование кандидата считывается не сразу: роль, уровень и специализацию нужно показать яснее.",
  missing_metrics:
    "Не хватает метрик: сроков, объёмов, нагрузки, процента улучшений или бизнес-результатов.",
  low_scanability:
    "Резюме сложно быстро просканировать: важные аргументы не вынесены достаточно явно.",
  overlong_resume:
    "Резюме перегружено длинными блоками, из-за чего рекрутеру сложнее быстро найти главное.",
  inconsistent_titles:
    "Названия должностей или целевая роль выглядят не полностью согласованными между собой.",
};

function isUseful(value: string) {
  return Boolean(value.trim()) && !EMPTY_PATTERN.test(value.trim());
}

function cleanList(values: string[]) {
  const result: string[] = [];

  for (const value of values) {
    const item = value.trim();

    if (isUseful(item) && !result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}

function addUnique(values: string[], value: string) {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function hasFlag(analysis: ResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

function normalizeFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.map((flag) => ({
    ...flag,
    explanation: isUseful(flag.explanation) ? flag.explanation : flagText[flag.type],
  }));
}

function getWeaknesses(analysis: ResumeAnalysis) {
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
      "Быстрый HR-скан слабый: ключевые достижения и ценность кандидата не считываются за первые секунды."
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

function getAtsIssues(analysis: ResumeAnalysis) {
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
      "Структура усложняет первичный скан: важные технологии и результаты лучше вынести ближе к началу блоков."
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

function getRecommendations(analysis: ResumeAnalysis) {
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
      "Сократить длинные описания и вынести самые сильные достижения в первые строки каждого опыта."
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

export function normalizeResumeAnalysisPresentation(
  analysis: ResumeAnalysis
): ResumeAnalysis {
  const normalized = {
    ...analysis,
    redFlags: normalizeFlags(analysis.redFlags),
    strengths: cleanList(analysis.strengths),
    missingKeywords: cleanList(analysis.missingKeywords),
  };

  return {
    ...normalized,
    weaknesses: getWeaknesses(normalized),
    atsIssues: getAtsIssues(normalized),
    recommendations: getRecommendations(normalized),
  };
}

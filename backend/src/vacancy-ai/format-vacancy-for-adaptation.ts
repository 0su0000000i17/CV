import type { NormalizedVacancy } from "./types.js";
import { getCandidateCriteria } from "./candidate-criteria.js";

export function formatVacancyForAdaptation(vacancy: NormalizedVacancy) {
  const blocks: string[] = [];

  addLine(blocks, "Название вакансии", vacancy.title);
  addLine(blocks, "Компания", vacancy.company);
  addLine(blocks, "Локация", vacancy.location);
  addLine(blocks, "Зарплата", vacancy.salary);
  addLine(blocks, "Формат работы", vacancy.workFormat);
  addLine(blocks, "Занятость", vacancy.employment);
  addLine(blocks, "График", vacancy.schedule);
  addLine(blocks, "Уровень", vacancy.seniority);

  if (vacancy.summary) {
    blocks.push(`\nОписание:\n${vacancy.summary}`);
  }

  addList(blocks, "Обязанности", vacancy.responsibilities);
  addList(blocks, "Требования", vacancy.requirements);
  addList(blocks, "Будет плюсом", vacancy.niceToHave);
  addList(blocks, "Условия", vacancy.conditions);
  addList(blocks, "Ключевые навыки", vacancy.skills);

  return blocks.join("\n").trim();
}

function addLine(blocks: string[], label: string, value: string | null) {
  if (!value) {
    return;
  }

  blocks.push(`${label}: ${value}`);
}

function addList(blocks: string[], title: string, items: string[]) {
  const cleanedItems = items.map((item) => item.trim()).filter(Boolean);

  if (!cleanedItems.length) {
    return;
  }

  blocks.push(`\n${title}:`);
  blocks.push(...cleanedItems.map((item) => `- ${item}`));
}

export function formatVacancyForCandidateEvaluation(vacancy: NormalizedVacancy) {
  const blocks: string[] = [];
  addLine(blocks, "Название вакансии", vacancy.title);
  addLine(blocks, "Уровень", vacancy.seniority);
  addList(blocks, "Профессиональные задачи", vacancy.responsibilities);
  const criteria = getCandidateCriteria(vacancy);
  if (!vacancy.responsibilities.length && !criteria.length) {
    addLine(blocks, "Профессиональный контекст", vacancy.summary);
  }
  addList(blocks, "Обязательные критерии к кандидату", criteria
    .filter((item) => item.priority === "required").map((item) => item.text));
  addList(blocks, "Желательные критерии к кандидату", criteria
    .filter((item) => item.priority === "preferred").map((item) => item.text));
  return blocks.join("\n").trim();
}

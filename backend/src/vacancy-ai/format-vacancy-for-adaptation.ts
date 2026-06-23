import type { NormalizedVacancy } from "./types.js";

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
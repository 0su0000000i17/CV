import assert from "node:assert/strict";
import test from "node:test";

import { getCandidateCriteria } from "./candidate-criteria.js";
import { formatVacancyForCandidateEvaluation } from "./format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "./types.js";

const vacancy: NormalizedVacancy = {
  isVacancy: true, rejectionReason: null, title: "Разработчик", company: "Компания",
  location: "Москва", salary: "не указана", employment: "полная", workFormat: "гибрид",
  schedule: "5/2, 8 часов", seniority: "Middle", summary: null,
  responsibilities: ["Развивать внутреннее приложение работодателя"],
  requirements: [
    "TypeScript", "График 5/2", "8 часов в день", "Зарплата от 200 000 рублей",
    "Реализовывать стратегические задачи для приложения работодателя",
    "Ответственность и коммуникабельность",
    "Опыт самостоятельной разработки UI-компонентов",
    "Построение графиков в Highcharts",
    "Интеграция оплаты через Stripe",
    "Microsoft Office",
  ],
  niceToHave: ["Опыт с GraphQL"], conditions: ["ДМС"], skills: ["React"],
  warnings: [], confidence: 1,
};

test("separates candidate evidence from employment conditions and employer tasks", () => {
  const criteria = getCandidateCriteria(vacancy).map((item) => item.text);
  assert.deepEqual(criteria, [
    "TypeScript", "Опыт самостоятельной разработки UI-компонентов",
    "Построение графиков в Highcharts", "Интеграция оплаты через Stripe", "Microsoft Office",
    "Опыт с GraphQL", "React",
  ]);
  const text = formatVacancyForCandidateEvaluation(vacancy);
  assert.match(text, /TypeScript/u);
  assert.doesNotMatch(text, /зарплат|график(?![а-яё])|5\/2|ДМС|гибрид/iu);
});

test("classifies practical experience with a named technology as a skill gap", () => {
  const criteria = getCandidateCriteria({
    ...vacancy,
    requirements: ["Практический опыт с GraphQL"],
    niceToHave: [],
    skills: [],
  });
  assert.equal(criteria.length, 1);
  assert.equal(criteria[0]!.kind, "skill");
});

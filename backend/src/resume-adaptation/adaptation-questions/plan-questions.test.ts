import assert from "node:assert/strict";
import test from "node:test";

import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitResult } from "../types.js";
import { planAdaptationQuestions } from "./plan-questions.js";

const vacancy: NormalizedVacancy = {
  isVacancy: true, rejectionReason: null, title: "Frontend-разработчик", company: "ИВИ",
  location: "Москва", salary: "не указана", employment: "полная занятость",
  workFormat: "офис", schedule: "5/2, 8 часов", seniority: "Middle", summary: null,
  responsibilities: [
    "Реализовывать большие (и маленькие) стратегические задачи для приложения ИВИ для Smart TV-платформ",
  ],
  requirements: ["Практический опыт с GraphQL"], niceToHave: [], conditions: ["ДМС"],
  skills: ["GraphQL"], warnings: [], confidence: 0.95,
};

const fit: ResumeVacancyFitResult = {
  canAdapt: true, fit: "partial", score: 60, confidence: 0.8,
  resumeRole: "Frontend-разработчик", vacancyRole: "Frontend-разработчик",
  careerMove: "same_role", adaptationMode: "safe", reason: "Нужно уточнение",
  safeAdaptationDirection: null, matchedRequirements: [], transferableExperience: [],
  gaps: ["Зарплата: не указана", "График: 5/2, 8 часов", "Опыт GraphQL"],
  blockingGaps: [], allowedChanges: [], forbiddenChanges: [], riskFlags: [],
};

test("asks only answerable candidate gaps and never pads the interview", () => {
  const resumeJson = JSON.stringify({
    target: { title: "Frontend-разработчик" },
    experience: { items: [{ company: { name: "Сбер" }, position: "Frontend-разработчик" }] },
    skills: { items: ["React", "TypeScript"] },
  });
  const questions = planAdaptationQuestions({ resumeJson, vacancy, fit });
  const text = questions.map((question) => question.question).join("\n");
  assert.equal(questions.length, 1);
  assert.ok(questions.some((question) => question.requirement?.includes("GraphQL")));
  assert.doesNotMatch(text, /зарплат|график|5\/2|ИВИ|стратегические задачи/iu);
  assert.doesNotMatch(text, /подтвержд[её]нный опыт по требованию/iu);
  const positive = questions[0]!.options.filter((option) => option.confirmsRequirement);
  assert.ok(positive.length >= 1);
  assert.ok(positive.every((option) => option.custom));
  assert.match(questions[0]!.question, /где и для какой задачи/iu);
});

test("does not ask about a requirement already present in the resume", () => {
  const resumeJson = JSON.stringify({
    target: { title: "Frontend-разработчик" },
    experience: { items: [{ company: { name: "Сбер" }, position: "Frontend-разработчик" }] },
    skills: { items: ["React", "TypeScript", "GraphQL"] },
  });
  assert.deepEqual(planAdaptationQuestions({ resumeJson, vacancy, fit }), []);
});

test("keeps conditions and employer duties out across one hundred vacancy variants", () => {
  for (let index = 0; index < 100; index += 1) {
    const skill = `Tool${index}`;
    const variant = {
      ...vacancy,
      requirements: [`Практический опыт с ${skill}`],
      responsibilities: [`Реализовывать продуктовую задачу номер ${index}`],
      conditions: [`График 5/2 и зарплата ${index}`],
      skills: [skill],
    };
    const questions = planAdaptationQuestions({
      resumeJson: JSON.stringify({
        target: { title: "Frontend-разработчик" },
        experience: { items: [{ company: { name: "Компания" }, position: "Разработчик" }] },
        skills: { items: ["TypeScript"] },
      }),
      vacancy: variant,
      fit,
    });
    assert.equal(questions.length, 1);
    assert.equal(questions[0]!.requirement, `Практический опыт с ${skill}`);
    assert.doesNotMatch(JSON.stringify(questions), /зарплат|график|5\/2|продуктовую задачу/iu);
  }
});

import assert from "node:assert/strict";
import test from "node:test";

import { clarifyingAnswersSchema } from "./clarifying-answers-schema.js";
import { normalizedVacancySchema } from "./normalized-vacancy-schema.js";
import { resumeVacancyFitSchema } from "./resume-vacancy-fit-schema.js";

test("vacancy and fit schemas reject incomplete or unknown client fields", () => {
  assert.equal(normalizedVacancySchema.safeParse({ isVacancy: true }).success, false);
  assert.equal(resumeVacancyFitSchema.safeParse({
    canAdapt: true,
    adaptationMode: "safe",
  }).success, false);
  const vacancy = {
    isVacancy: true,
    rejectionReason: null,
    title: "Frontend-разработчик",
    company: null,
    location: null,
    salary: null,
    employment: null,
    workFormat: null,
    schedule: null,
    seniority: null,
    summary: null,
    responsibilities: [],
    requirements: [],
    niceToHave: [],
    conditions: [],
    skills: [],
    warnings: [],
    confidence: 1,
    injected: true,
  };
  assert.equal(normalizedVacancySchema.safeParse(vacancy).success, false);
});

test("clarifying answers are bounded and require an actual action", () => {
  assert.equal(clarifyingAnswersSchema.safeParse({}).success, false);
  assert.equal(clarifyingAnswersSchema.safeParse({ skipped: false }).success, false);
  assert.equal(clarifyingAnswersSchema.safeParse({ skipped: true }).success, true);
  assert.equal(clarifyingAnswersSchema.safeParse({
    answers: [{ questionId: "q1", optionKey: "a", customText: "x".repeat(501) }],
  }).success, false);
});

test("rejects aggregate AI context payloads that exceed the hard boundary", () => {
  const repeated = Array.from({ length: 100 }, () => "x".repeat(1_000));
  const vacancy = {
    isVacancy: true,
    rejectionReason: null,
    title: "Разработчик",
    company: null,
    location: null,
    salary: null,
    employment: null,
    workFormat: null,
    schedule: null,
    seniority: null,
    summary: null,
    responsibilities: repeated,
    requirements: repeated,
    niceToHave: [],
    conditions: [],
    skills: [],
    warnings: [],
    confidence: 1,
  };
  assert.equal(normalizedVacancySchema.safeParse(vacancy).success, false);
});

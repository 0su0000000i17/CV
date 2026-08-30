import assert from "node:assert/strict";
import test from "node:test";

import {
  findConfirmedFactIntegrationIssues,
  repairConfirmedFactIntegrationIssues,
} from "./confirmed-fact-integration-check.js";
import { adaptation, fact, resumeJson } from "./confirmed-fact-integration-test-helpers.js";

test("does not treat question wording as evidence that a second answer reached a bullet", () => {
  const first = fact({
    id: "mentoring",
    topic: "leadership",
    question: "Как помогали развиваться коллегам в компании Альфа?",
    answer: "Проводил ревью и помогал новым коллегам осваивать процессы",
  });
  const second = fact({
    id: "client",
    topic: "collaboration",
    question: "Как проводили ревью и помогали коллегам осваивать процессы?",
    answer: "Собирал требования заказчика и фиксировал договорённости",
  });
  const result = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson("Поддерживал внутренний рабочий портал."),
    confirmedFacts: [first, second],
    adaptation: adaptation(["Проводил ревью и помогал новым коллегам осваивать процессы."]),
  });

  assert.equal(result.some((issue) => issue.type === "multiple_unrelated_facts"), false);
});

test("deterministic repair restores source bullets for an affected experience item", () => {
  const source = "Поддерживал внутренний рабочий портал.";
  const first = fact({
    id: "mentoring",
    topic: "leadership",
    question: "Как помогали развиваться коллегам в компании Альфа?",
    answer: "Проводил ревью и помогал новым коллегам осваивать процессы",
  });
  const second = fact({
    id: "client",
    topic: "collaboration",
    question: "Как работали с заказчиком в компании Альфа?",
    answer: "Собирал требования заказчика и фиксировал договорённости",
  });
  const generated = adaptation([
    "Проводил ревью и помогал новым коллегам осваивать процессы, собирая требования заказчика и фиксируя договорённости.",
  ]);
  const issues = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson(source),
    confirmedFacts: [first, second],
    adaptation: generated,
  });
  const repaired = repairConfirmedFactIntegrationIssues({
    resumeJson: resumeJson(source),
    adaptation: generated,
    issues,
  });

  assert.deepEqual(repaired.adaptedResume.experience[0]?.adaptedBullets, [source]);
});

test("checks every bullet when a fact is validly present once but also glued elsewhere", () => {
  const confirmed = fact({
    id: "auth-libraries",
    topic: "hard_skill",
    question: "Какие библиотеки использовали для аутентификации?",
    answer: "Дополнительные библиотеки для аутентификации и авторизации",
  });
  const result = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson("Оптимизировал личный кабинет и устранил каскадные ре-рендеры."),
    confirmedFacts: [confirmed],
    adaptation: adaptation([
      "Разработал аутентификацию и авторизацию с дополнительными профильными библиотеками.",
      "Оптимизировал личный кабинет и устранил каскадные ре-рендеры, используя дополнительные библиотеки для аутентификации и авторизации.",
    ]),
  });

  assert.ok(result.some((issue) =>
    issue.type === "unrelated_merge" && issue.bullet.includes("каскадные ре-рендеры")
  ));
});

import assert from "node:assert/strict";
import test from "node:test";

import { findConfirmedFactIntegrationIssues } from "./confirmed-fact-integration-check.js";
import { adaptation, fact, resumeJson } from "./confirmed-fact-integration-test-helpers.js";

test("detects a confirmed collaboration fact glued to an unrelated technical bullet", () => {
  const source = "Оптимизировал загрузку отчётов за счёт кэширования повторных запросов.";
  const confirmed = fact({
    id: "collaboration",
    topic: "collaboration",
    question: "Как согласовывали требования с заказчиками в компании Альфа?",
    answer: "Проводил встречи с заказчиками и фиксировал согласованные требования",
  });
  const result = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson(source),
    confirmedFacts: [confirmed],
    adaptation: adaptation([
      "Оптимизировал загрузку отчётов за счёт кэширования повторных запросов, проводя встречи с заказчиками и фиксируя согласованные требования.",
    ]),
  });

  assert.ok(result.some((issue) => issue.type === "unrelated_merge"));
});

test("allows a confirmed metric or scope to strengthen the same source action", () => {
  const source = "Внедрил масштабируемую дизайн-систему адаптивных компонентов.";
  const confirmed = fact({
    id: "scope",
    topic: "metrics",
    question: "Сколько компонентов вошло в дизайн-систему компании Альфа?",
    answer: "В дизайн-систему вошло около 30 компонентов",
  });
  const result = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson(source),
    confirmedFacts: [confirmed],
    adaptation: adaptation([
      "Внедрил масштабируемую дизайн-систему из 30 адаптивных компонентов.",
    ]),
  });

  assert.deepEqual(result, []);
});

test("detects unrelated answers from different questions combined into one bullet", () => {
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
  const result = findConfirmedFactIntegrationIssues({
    resumeJson: resumeJson("Поддерживал внутренний рабочий портал."),
    confirmedFacts: [first, second],
    adaptation: adaptation([
      "Проводил ревью и помогал новым коллегам осваивать процессы, собирая требования заказчика и фиксируя договорённости.",
    ]),
  });

  assert.ok(result.some((issue) => issue.type === "multiple_unrelated_facts"));
});

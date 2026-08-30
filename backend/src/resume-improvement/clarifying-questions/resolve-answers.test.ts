import assert from "node:assert/strict";
import test from "node:test";

import { resolveConfirmedFacts } from "./resolve-answers.js";
import type { ClarifyingQuestion } from "./types.js";

const question: ClarifyingQuestion = {
  id: "q1",
  question: "В каком проекте применяли Docker?",
  targetArea: "tools",
  kind: "experience",
  purpose: "gap",
  topic: "hard_skill",
  sourceIndex: 2,
  options: [
    { key: "a", label: "Сбер — настраивал контейнеризацию сервисов" },
    { key: "b", label: "Нет, не работал с Docker" },
  ],
};

test("marks refusals as non-supporting facts", () => {
  const facts = resolveConfirmedFacts({
    questions: [question],
    answers: [{ questionId: "q1", optionKey: "b" }],
  });

  assert.equal(facts.length, 1);
  assert.match(facts[0], /^\[ОТКАЗ:/u);
});

test("adds a deterministic placement tag to positive facts", () => {
  const facts = resolveConfirmedFacts({
    questions: [question],
    answers: [{ questionId: "q1", optionKey: "a" }],
  });

  assert.match(facts[0], /^\[В ОПЫТ/u);
  assert.match(facts[0], /sourceIndex 2/u);
  assert.match(facts[0], /questionId=q1/u);
  assert.match(facts[0], /integration=atomic/u);
});

import assert from "node:assert/strict";
import test from "node:test";

import type { ClarifyingQuestion } from "../../resume-improvement/clarifying-questions/types.js";
import { resolveAdaptationConfirmedFacts } from "./resolve-adaptation-facts.js";

function gapQuestion(): ClarifyingQuestion {
  return {
    id: "graphql",
    question: "Где применяли GraphQL?",
    targetArea: "tools",
    requirement: "GraphQL",
    kind: "experience",
    purpose: "gap",
    topic: "hard_skill",
    options: [{
      key: "work_0",
      label: "Сбер — Frontend-разработчик — опишу конкретную задачу и результат",
      custom: true,
      confirmsRequirement: true,
    }],
  };
}

test("keeps the selected workplace when a practical answer is entered as text", () => {
  const facts = resolveAdaptationConfirmedFacts({
    questions: [gapQuestion()],
    answers: [{
      questionId: "graphql",
      optionKey: "work_0",
      customText: "Настроил запросы каталога и обработку ошибок API",
    }],
    companies: [{ sourceIndex: 0, name: "Сбер" }],
  });
  assert.equal(facts.length, 1);
  assert.match(facts[0]!, /В ОПЫТ места «Сбер» \(sourceIndex 0\)/u);
  assert.match(facts[0]!, /Настроил запросы каталога/u);
});

test("keeps a typed refusal as a refusal even after a workplace was selected", () => {
  const facts = resolveAdaptationConfirmedFacts({
    questions: [gapQuestion()],
    answers: [{
      questionId: "graphql",
      optionKey: "work_0",
      customText: "Нет, не работал с GraphQL",
    }],
    companies: [{ sourceIndex: 0, name: "Сбер" }],
  });
  assert.match(facts[0]!, /^\[ОТКАЗ:/u);
});

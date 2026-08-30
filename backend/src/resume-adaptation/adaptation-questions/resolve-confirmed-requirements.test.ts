import assert from "node:assert/strict";
import test from "node:test";

import { resolveConfirmedRequirements } from "./resolve-confirmed-requirements.js";
import type { ClarifyingQuestion } from "../../resume-improvement/clarifying-questions/types.js";

function question(
  purpose: ClarifyingQuestion["purpose"],
  custom = false
): ClarifyingQuestion {
  return {
    id: "q",
    question: "Работали с Docker?",
    targetArea: "tools",
    requirement: "Docker",
    kind: "experience",
    purpose,
    topic: "hard_skill",
    options: custom
      ? [{ key: "custom", label: "Свой вариант", custom: true }]
      : [{ key: "yes", label: "Сбер — настраивал Docker" }],
  };
}

test("does not promote evidence questions into confirmed vacancy requirements", () => {
  const requirements = resolveConfirmedRequirements({
    questions: [question("evidence")],
    answers: [{ questionId: "q", optionKey: "yes" }],
  });

  assert.deepEqual(requirements, []);
});

test("does not treat a free-text refusal as requirement confirmation", () => {
  const requirements = resolveConfirmedRequirements({
    questions: [question("gap", true)],
    answers: [
      {
        questionId: "q",
        optionKey: "custom",
        customText: "Нет, не работал с Docker",
      },
    ],
  });

  assert.deepEqual(requirements, []);
});

test("does not promote theoretical or explicitly non-confirming answers", () => {
  const theoretical = question("gap");
  theoretical.options = [{
    key: "theory",
    label: "Знаком теоретически, но без практического опыта",
    confirmsRequirement: false,
  }];
  assert.deepEqual(resolveConfirmedRequirements({
    questions: [theoretical],
    answers: [{ questionId: "q", optionKey: "theory" }],
  }), []);
  assert.deepEqual(resolveConfirmedRequirements({
    questions: [question("gap", true)],
    answers: [{ questionId: "q", optionKey: "custom", customText: "Только теоретически" }],
  }), []);
});

test("keeps an explicit commercial confirmation even when a learning project is mentioned", () => {
  assert.deepEqual(resolveConfirmedRequirements({
    questions: [question("gap", true)],
    answers: [{
      questionId: "q",
      optionKey: "custom",
      customText: "Начинал в учебном проекте, затем применял в работе на production-проекте",
    }],
  }), ["Docker"]);
});

test("does not confirm a requirement through a non-commercial custom option", () => {
  const nonCommercial = question("gap", true);
  nonCommercial.options[0]!.confirmsRequirement = false;
  assert.deepEqual(resolveConfirmedRequirements({
    questions: [nonCommercial],
    answers: [{
      questionId: "q",
      optionKey: "custom",
      customText: "Использовал в учебном проекте для локального окружения",
    }],
  }), []);
});

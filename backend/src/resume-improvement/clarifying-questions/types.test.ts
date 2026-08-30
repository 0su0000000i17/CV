import assert from "node:assert/strict";
import test from "node:test";

import { expandClarifyingAnswers, type ClarifyingQuestion } from "./types.js";

const multipleQuestion: ClarifyingQuestion = {
  id: "q1",
  question: "Какие ситуации встречались?",
  targetArea: "collaboration",
  multiple: true,
  options: [
    { key: "a", label: "Менялись требования" },
    { key: "b", label: "Не было таких ситуаций" },
    { key: "custom", label: "Свой вариант", custom: true },
  ],
};

test("keeps a refusal mutually exclusive on the server", () => {
  assert.deepEqual(expandClarifyingAnswers([multipleQuestion], [{ questionId: "q1", optionKeys: ["a", "b"] }]), [
    { questionId: "q1", optionKey: "b" },
  ]);
});

test("accepts multiple positive facts when the question is additive", () => {
  assert.deepEqual(
    expandClarifyingAnswers(
      [multipleQuestion],
      [
        {
          questionId: "q1",
          optionKeys: ["a", "custom"],
          customText: "Срочно менялся API",
        },
      ],
    ),
    [
      { questionId: "q1", optionKey: "a" },
      {
        questionId: "q1",
        optionKey: "custom",
        customText: "Срочно менялся API",
      },
    ],
  );
});

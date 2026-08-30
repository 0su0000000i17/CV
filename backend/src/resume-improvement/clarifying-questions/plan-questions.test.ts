import assert from "node:assert/strict";
import test from "node:test";

import { planImprovementQuestions } from "./plan-questions.js";

function resume(params: {
  target: string;
  positions?: string[];
  claims?: string[];
  skills?: string[];
}) {
  const positions = params.positions || [params.target];
  return JSON.stringify({
    target: { title: params.target },
    experience: { items: positions.map((position, sourceIndex) => ({
      sourceIndex,
      company: { name: sourceIndex ? "Сбер" : "Проектная деятельность - CVmatch" },
      position,
      blocks: (params.claims || []).map((text) => ({ type: "bullet", text })),
    })) },
    skills: { items: params.skills || [] },
  });
}

test("asks for evidence behind a concrete source claim instead of rechecking known skills", () => {
  const questions = planImprovementQuestions({
    resumeJson: resume({
      target: "Fullstack-разработчик",
      claims: ["Разрабатывал клиентскую и серверную части сервиса поиска работы"],
      skills: ["JavaScript", "HTML", "React"],
    }),
    signals: { redFlags: [{ type: "weak_evidence", explanation: "Не показан результат" }] },
  });
  assert.equal(questions.length, 1);
  assert.match(questions[0]!.question, /Разрабатывал клиентскую и серверную части/iu);
  assert.equal(questions[0]!.sourceIndex, 0);
  assert.equal(questions[0]!.options.filter((option) => option.custom).length, 3);
  const rendered = JSON.stringify(questions);
  assert.doesNotMatch(rendered, /какие.*(?:инструмент|навык)|классов инструментов/iu);
  assert.doesNotMatch(
    questions[0]!.options.map((option) => option.label).join(" "),
    /JavaScript|HTML|React|Регулярно применял/iu,
  );
});

test("does not manufacture questions when a focused resume already contains evidence", () => {
  const questions = planImprovementQuestions({
    resumeJson: resume({
      target: "Frontend-разработчик",
      claims: ["Снизил время загрузки интерфейса на 38% после профилирования критического пути"],
    }),
  });
  assert.deepEqual(questions, []);
});

test("asks about positioning only when the target is genuinely ambiguous", () => {
  const questions = planImprovementQuestions({
    resumeJson: resume({
      target: "Frontend-разработчик / Fullstack-разработчик",
      positions: ["Fullstack-разработчик"],
      claims: ["Снизил число ошибок на 30% с помощью автоматических проверок релиза"],
    }),
  });
  assert.equal(questions.length, 1);
  assert.equal(questions[0]!.topic, "positioning");
  assert.deepEqual(
    questions[0]!.options.slice(0, 2).map((option) => option.label),
    ["Frontend-разработчик", "Fullstack-разработчик"],
  );
});

test("asks for one scoped result when an experience item has no claims", () => {
  const questions = planImprovementQuestions({
    resumeJson: resume({ target: "Product manager", claims: [] }),
  });
  assert.equal(questions.length, 1);
  assert.match(questions[0]!.question, /не описаны результаты работы/iu);
});

test("keeps existing skills out of answer options across one hundred resume variants", () => {
  const roles = [
    "Frontend-разработчик", "Product manager", "Менеджер по продажам",
    "Маркетолог", "UX/UI-дизайнер",
  ];
  for (let index = 0; index < 100; index += 1) {
    const skills = [`Навык-${index}`, `Инструмент-${index}`, `Технология-${index}`];
    const questions = planImprovementQuestions({
      resumeJson: resume({
        target: roles[index % roles.length]!,
        claims: [`Выполнял ключевую рабочую задачу номер ${index}`],
        skills,
      }),
    });
    const options = questions.flatMap((question) => question.options.map((option) => option.label));
    assert.ok(questions.length <= 4);
    assert.ok(skills.every((skill) => options.every((option) => !option.includes(skill))));
    assert.doesNotMatch(JSON.stringify(questions), /классов инструментов|Регулярно применял/iu);
  }
});

import assert from "node:assert/strict";
import test from "node:test";

import type { ResumeAdaptationResult } from "../types.js";
import {
  enrichConfirmedFactsWithSources,
  findDumpedConfirmedFacts,
  findMisroutedCompanyFacts,
  parseConfirmedFact,
} from "./confirmed-facts-placement-check.js";

function adaptation(
  overrides: Partial<ResumeAdaptationResult["adaptedResume"]> = {}
): ResumeAdaptationResult {
  return {
    target: { title: null, company: null, seniority: null, keywordsUsed: [] },
    adaptedResume: {
      headline: "Frontend-разработчик",
      summary: "Разрабатываю корпоративные веб-приложения.",
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [
        {
          sourceIndex: 1,
          company: "Банк Открытие",
          position: "Frontend-разработчик",
          dates: null,
          adaptedBullets: ["Разработал модули аутентификации"],
          focus: null,
          preservedFacts: [],
          warnings: [],
        },
      ],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
      ...overrides,
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

test("detects a confirmed answer pasted as a dangling additional-info line", () => {
  const result = findDumpedConfirmedFacts(
    ["Какое дополнительное обучение проходили? -> Курс по оптимизации производительности веб-приложений"],
    adaptation({ additionalInfo: ["Курс по оптимизации производительности веб-приложений"] })
  );

  assert.deepEqual(result, [
    {
      location: "additionalInfo",
      text: "Курс по оптимизации производительности веб-приложений",
    },
  ]);
});

test("routes an improvement fact by a company named in the question", () => {
  const result = findMisroutedCompanyFacts(
    ["Какой вклад вы внесли в проект в Банк Открытие? -> Внедрил дизайн-систему компонентов"],
    adaptation(),
    [{ sourceIndex: 1, name: "Банк Открытие" }]
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.sourceIndex, 1);
});

test("enriches legacy improvement facts with a stable sourceIndex from the company mention", () => {
  const [fact] = enrichConfirmedFactsWithSources(
    [
      "[В ОПЫТ места, названного в вопросе] [FACT questionId=q1; kind=experience; purpose=evidence; topic=achievement; integration=atomic] Какой вклад вы внесли в проект компании Альфа Логистика? -> Настроил контроль сроков доставки",
    ],
    [
      { sourceIndex: 3, name: "Альфа Логистика" },
      { sourceIndex: 1, name: "Бета" },
    ]
  );

  assert.equal(parseConfirmedFact(fact || "").sourceIndex, 3);
});

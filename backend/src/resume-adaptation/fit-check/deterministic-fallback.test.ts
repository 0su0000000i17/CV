import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { createDeterministicFitFallback } from "./deterministic-fallback.js";

const vacancy: NormalizedVacancy = {
  isVacancy: true, rejectionReason: null, title: "Frontend-разработчик", company: "ИВИ",
  location: "Москва", salary: "не указана", employment: "полная", workFormat: "офис",
  schedule: "5/2, 8 часов", seniority: "Middle", summary: null,
  responsibilities: ["Реализовывать стратегические задачи для Smart TV"],
  requirements: ["TypeScript", "GraphQL", "График 5/2"], niceToHave: [],
  conditions: ["ДМС"], skills: [], warnings: [], confidence: 0.9,
};

test("local fit fallback uses only candidate criteria and never employment conditions", () => {
  const fit = createDeterministicFitFallback({
    vacancy,
    resumeJson: JSON.stringify({
      target: { title: "Frontend-разработчик" },
      skills: { items: ["TypeScript"] },
    }),
  });
  assert.equal(fit.canAdapt, true);
  assert.ok(fit.matchedRequirements.includes("TypeScript"));
  assert.ok(fit.gaps.includes("GraphQL"));
  assert.doesNotMatch([...fit.gaps, ...fit.matchedRequirements].join(" "),
    /зарплат|график(?![а-яё])|5\/2|ДМС|Smart TV/iu);
});

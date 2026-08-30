import assert from "node:assert/strict";
import test from "node:test";

import { normalizeVacancy, parseVacancyJson } from "./json.js";

test("parses fenced vacancy JSON and bounds model-controlled output", () => {
  const parsed = parseVacancyJson(`\`\`\`json
{"isVacancy":true,"title":"Developer","requirements":["React"]}
\`\`\``);
  const vacancy = normalizeVacancy(parsed);
  assert.equal(vacancy.isVacancy, true);
  assert.equal(vacancy.title, "Developer");
  assert.deepEqual(vacancy.requirements, ["React"]);
});

test("does not carry vacancy fields when the response rejects the input", () => {
  const vacancy = normalizeVacancy({
    isVacancy: false,
    title: "Injected title",
    requirements: ["Injected requirement"],
  });
  assert.equal(vacancy.title, null);
  assert.deepEqual(vacancy.requirements, []);
});

test("drops model criteria sourced from responsibilities", () => {
  const vacancy = normalizeVacancy({
    isVacancy: true,
    requirements: ["GraphQL"],
    candidateCriteria: [{
      text: "Развивать приложение работодателя",
      kind: "experience",
      priority: "required",
      evidence: "practice",
      source: "requirement",
    }],
  });
  assert.deepEqual(vacancy.candidateCriteria?.map((item) => item.text), ["GraphQL"]);
});

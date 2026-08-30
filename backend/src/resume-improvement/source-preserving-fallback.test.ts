import assert from "node:assert/strict";
import test from "node:test";

import { createSourcePreservingImprovementFallback } from "./source-preserving-fallback.js";

test("creates a valid no-change improvement result from the source payload", () => {
  const result = createSourcePreservingImprovementFallback(
    JSON.stringify({
      target: {
        title: "Frontend-разработчик",
        salary: "250 000 руб.",
        specializations: ["Программист, разработчик"],
      },
      additional: {
        about: "Разрабатываю клиентские приложения.",
      },
    }),
  );

  assert.equal(result.target.title, "Frontend-разработчик");
  assert.equal(result.target.salary, "250 000 руб.");
  assert.deepEqual(result.target.specializations, ["Программист, разработчик"]);
  assert.equal(
    result.adaptedResume.summary,
    "Разрабатываю клиентские приложения.",
  );
  assert.deepEqual(result.adaptedResume.experience, []);
  assert.equal(result.warnings.length, 1);
});

test("remains valid when the source payload itself cannot be parsed", () => {
  const result = createSourcePreservingImprovementFallback("{broken");

  assert.equal(result.adaptedResume.summary, "");
  assert.deepEqual(result.adaptedResume.experience, []);
  assert.equal(result.warnings.length, 1);
});

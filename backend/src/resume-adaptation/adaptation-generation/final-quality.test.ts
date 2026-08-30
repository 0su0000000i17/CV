import assert from "node:assert/strict";
import test from "node:test";

import type { ResumeAdaptationResult } from "../types.js";
import { ensureFinalNarrativeQuality } from "./final-quality.js";

function result(summary: string): ResumeAdaptationResult {
  return {
    target: { title: "Frontend-разработчик", company: null, seniority: null, keywordsUsed: [] },
    adaptedResume: {
      headline: "Frontend-разработчик",
      summary,
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
    changes: [], warnings: [], forbiddenClaims: [], metricGaps: [],
  };
}

test("preserves a trusted source summary when generated narration stays unsafe", () => {
  const source = JSON.stringify({
    target: { title: "Frontend-разработчик" },
    additional: { about: ["Разрабатываю интерфейсы и улучшаю качество продукта."] },
  });
  const repaired = ensureFinalNarrativeQuality(
    source,
    result("Frontend-разработчик. Разрабатывает интерфейсы и улучшает продукт."),
  );
  assert.equal(repaired.adaptedResume.summary,
    "Разрабатываю интерфейсы и улучшаю качество продукта.");
  assert.ok(repaired.warnings.some((warning) => warning.includes("внутреннюю проверку")));
});

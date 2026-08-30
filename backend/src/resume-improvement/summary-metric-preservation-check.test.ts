import assert from "node:assert/strict";
import test from "node:test";

import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import { findDroppedSummaryMetrics } from "./summary-metric-preservation-check.js";

function adaptation(summary: string): ResumeAdaptationResult {
  return {
    target: { title: null, company: null, seniority: null, keywordsUsed: [] },
    adaptedResume: {
      headline: "Инженер",
      summary,
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

test("keeps quantitative evidence that the candidate already placed in summary", () => {
  const source = JSON.stringify({
    additional: {
      about: ["Оптимизирую процессы: подтверждённое сокращение срока на 35%."],
    },
  });

  assert.deepEqual(
    findDroppedSummaryMetrics(source, adaptation("Оптимизирую рабочие процессы.")),
    [
      {
        token: "35%",
        sourceText: "Оптимизирую процессы: подтверждённое сокращение срока на 35%.",
      },
    ]
  );
  assert.deepEqual(
    findDroppedSummaryMetrics(
      source,
      adaptation("Оптимизирую процессы и сокращал сроки на 35%.")
    ),
    []
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import type { ResumeAdaptationResult } from "../types.js";
import { findNarrativeQualityIssues } from "./narrative-quality-check.js";

const source = JSON.stringify({
  additional: {
    about: [
      "Frontend-разработчик с опытом создания корпоративных систем.",
      "Экспертиза в архитектуре и производительности интерфейсов.",
    ],
  },
  experience: {
    items: [
      {
        sourceIndex: 0,
        blocks: [
          { type: "bullet", text: "Разработал модуль авторизации для корпоративной системы" },
          { type: "bullet", text: "Внедрил библиотеку компонентов для продуктовой команды" },
          { type: "bullet", text: "Оптимизировал загрузку ключевых разделов приложения" },
        ],
      },
    ],
  },
});

function result(summary: string, bullets: string[]): ResumeAdaptationResult {
  return {
    target: { title: null, company: null, seniority: null, keywordsUsed: [] },
    adaptedResume: {
      headline: "Frontend-разработчик",
      summary,
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [
        {
          sourceIndex: 0,
          company: "Компания",
          position: "Frontend-разработчик",
          dates: null,
          adaptedBullets: bullets,
          focus: null,
          preservedFacts: [],
          warnings: [],
        },
      ],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

test("flags third-person summary and mostly copied experience", () => {
  const issues = findNarrativeQualityIssues(
    source,
    result(
      "Frontend-разработчик с опытом. Разрабатывает корпоративные интерфейсы и работает с React.",
      [
        "Разработал модуль авторизации для корпоративной системы",
        "Внедрил библиотеку компонентов для продуктовой команды",
        "Оптимизировал загрузку ключевых разделов приложения",
      ]
    )
  );

  const summaryIssue = issues.find((issue) =>
    issue.reason.includes("третьем лице")
  );
  const experienceIssue = issues.find((issue) =>
    issue.reason.includes("близкую к исходной")
  );

  assert.equal(summaryIssue?.severity, "blocking");
  assert.equal(experienceIssue?.severity, "advisory");
});

test("accepts a coherent first-person rewrite", () => {
  const issues = findNarrativeQualityIssues(
    source,
    result(
      "Frontend-разработчик с опытом корпоративных систем. Разрабатываю масштабируемые интерфейсы и специализируюсь на архитектуре клиентских приложений.",
      [
        "Спроектировал безопасный контур входа и разграничения доступа для корпоративного продукта",
        "Сформировал единый набор переиспользуемых UI-компонентов для продуктовой разработки",
        "Перестроил загрузку разделов приложения, устранив лишнюю работу интерфейса",
      ]
    )
  );

  assert.deepEqual(issues, []);
});

import assert from "node:assert/strict";
import test from "node:test";

import { getCandidateCriteria } from "../candidate-criteria.js";
import { normalizeStructuredVacancyText } from "./structured-text.js";

test("uses a complete sectioned vacancy without an AI normalization round-trip", () => {
  const vacancy = normalizeStructuredVacancyText({
    metadata: { method: "pasted_text", title: "Frontend-разработчик | Компания" },
    text: `Frontend-разработчик
Обязанности
Разрабатывать интерфейсы Smart TV
Требования
TypeScript
Практический опыт с GraphQL
Условия
График 5/2, 8 часов
Зарплата не указана`,
  });
  assert.ok(vacancy);
  assert.equal(vacancy.confidence, 0.86);
  assert.deepEqual(getCandidateCriteria(vacancy).map((item) => item.text), [
    "TypeScript", "Практический опыт с GraphQL",
  ]);
  assert.doesNotMatch(JSON.stringify(vacancy.candidateCriteria), /зарплат|график|5\/2/iu);
});

test("defers an unstructured fragment to AI normalization", () => {
  const vacancy = normalizeStructuredVacancyText({
    metadata: { method: "pasted_text", title: null },
    text: "Ищем хорошего специалиста в дружную команду",
  });
  assert.equal(vacancy, null);
});

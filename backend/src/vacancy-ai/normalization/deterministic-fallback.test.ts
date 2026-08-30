import assert from "node:assert/strict";
import test from "node:test";
import { getCandidateCriteria } from "../candidate-criteria.js";
import { createDeterministicVacancyFallback } from "./deterministic-fallback.js";

test("recovers a structured vacancy locally without turning conditions into criteria", () => {
  const vacancy = createDeterministicVacancyFallback({
    metadata: { method: "pasted_text", title: "Frontend-разработчик | Компания" },
    text: `Frontend-разработчик
Обязанности
Разрабатывать интерфейсы Smart TV
Требования
TypeScript
Практический опыт с GraphQL
Условия
График работы 5/2, 8 часов
Зарплата не указана
ДМС и гибридный формат`,
  });
  assert.equal(vacancy.isVacancy, true);
  assert.equal(vacancy.title, "Frontend-разработчик");
  assert.deepEqual(vacancy.requirements, ["TypeScript", "Практический опыт с GraphQL"]);
  assert.deepEqual(getCandidateCriteria(vacancy).map((item) => item.text),
    ["TypeScript", "Практический опыт с GraphQL"]);
  assert.doesNotMatch(getCandidateCriteria(vacancy).map((item) => item.text).join(" "),
    /зарплат|график(?![а-яё])|5\/2|ДМС|гибрид/iu);
});

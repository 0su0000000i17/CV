import assert from "node:assert/strict";
import test from "node:test";
import { getCandidateCriteria } from "../candidate-criteria.js";
import { normalizeStructuredJobPosting } from "./structured-job-posting.js";

test("normalizes schema.org JobPosting without an AI round trip", () => {
  const vacancy = normalizeStructuredJobPosting({
    metadata: { method: "playwright_rendered_dom", title: "Frontend-разработчик" },
    posting: {
      title: "Frontend-разработчик", company: "Компания", location: "Москва",
      employment: "FULL_TIME", workHours: "5/2, 8 часов", salary: "200000 RUB MONTH",
      description: "Команда развивает видеосервис.",
      responsibilities: "Разрабатывать интерфейсы Smart TV",
      qualifications: "TypeScript\nПрактический опыт с GraphQL",
      skills: "React, TypeScript", experienceRequirements: "Опыт от 3 лет",
      educationRequirements: "",
    },
  });
  assert.ok(vacancy);
  assert.equal(vacancy.company, "Компания");
  assert.equal(vacancy.schedule, "5/2, 8 часов");
  const criteria = getCandidateCriteria(vacancy).map((item) => item.text);
  assert.ok(criteria.includes("TypeScript"));
  assert.ok(criteria.includes("Практический опыт с GraphQL"));
  assert.doesNotMatch(criteria.join(" "), /зарплат|5\/2|8 часов|Smart TV/iu);
});

import assert from "node:assert/strict";
import test from "node:test";

import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "./source-document-to-editable.js";

test("source document conversion preserves constructor data", () => {
  const document = {
    version: 3,
    source: "hh_pdf",
    meta: { updatedAtRaw: null, serviceLines: [], ignoredVisualElements: [], sectionOrder: [] },
    personal: {
      fullName: "Иван Петров", gender: "Мужчина", age: "30", birthDate: null,
      phone: "+7 900 000-00-00", email: "n@example.ru", preferredContact: null,
      preferredContactRaw: null, city: "Москва", citizenship: "Россия",
      workPermit: "Россия", relocation: "не", businessTrips: null,
      telegram: null, links: [],
    },
    target: {
      title: "Frontend-разработчик", salary: "250 000 ₽", specializations: ["Разработка"],
      employment: "полная занятость", schedule: "полный день", workFormat: "удалённая работа",
      commuteTime: null, raw: [],
    },
    experience: { total: "5 лет", raw: [], items: [{
      id: "exp-1", sourceIndex: 0,
      dates: { start: "Апрель 2024", end: "Декабрь 2025", duration: null, raw: [] },
      company: { name: "Сбер", city: "Москва", url: "https://sber.ru", industries: ["Банк"], raw: [] },
      position: "Frontend-разработчик",
      blocks: [
        { id: "p1", type: "paragraph", text: "Высоконагруженные интерфейсы" },
        { id: "s1", type: "sectionTitle", title: "Достижения" },
        { id: "b1", type: "bullet", text: "Ускорил загрузку на 35%" },
      ],
      raw: [],
    }] },
    education: { level: "Высшее", raw: [], items: [{
      id: "edu-1", year: "2018", level: null, institution: "МГУ", faculty: null,
      specialization: "Информатика", details: null, raw: [],
    }] },
    courses: { items: [], raw: [] },
    skills: { languages: [], items: ["TypeScript", "Next.js"], raw: [] },
    additional: { about: ["Разрабатываю интерфейсы"], telegram: null, phone: null, email: null, raw: [] },
    diagnostics: { warnings: [], unknownBlocks: [] },
  } satisfies SourceResumeDocument;
  const result = sourceDocumentToEditableResume(document);
  assert.equal(result.contacts.gender, "Мужчина");
  assert.equal(result.resumeJson.adaptedResume.experience[0]?.company, "Сбер");
  assert.deepEqual(result.resumeJson.adaptedResume.experience[0]?.adaptedBullets, ["Ускорил загрузку на 35%"]);
  assert.deepEqual(result.resumeJson.adaptedResume.skills.primary, ["TypeScript", "Next.js"]);
  assert.match(result.resumeJson.adaptedResume.education.notes.join(" "), /МГУ/u);
});

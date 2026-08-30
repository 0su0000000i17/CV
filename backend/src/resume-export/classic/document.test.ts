import assert from "node:assert/strict";
import test from "node:test";

import { buildClassicDocument } from "./document.js";
import { classicExportSchema } from "./schema.js";

const payload = classicExportSchema.parse({
  sourceTitle: "Иван Иванов.pdf",
  contacts: {
    fullName: "Иван Иванов",
    phone: "+7 999 123-45-67",
    email: "ivan@example.com",
    city: "Москва",
  },
  adaptation: {
    target: {
      title: "Frontend-разработчик",
      company: null,
      seniority: null,
      keywordsUsed: ["React"],
    },
    adaptedResume: {
      headline: "Frontend-разработчик",
      summary: "Разрабатываю интерфейсы.",
      skills: {
        primary: ["React", "REST API", "Next.js App/Pages Router"],
        secondary: ["TypeScript"],
      },
      experience: [{
        sourceIndex: 0,
        company: "Сбер",
        position: "Frontend-разработчик",
        dates: "Апрель 2024 — Декабрь 2025",
        adaptedBullets: ["Разработал дизайн-систему"],
        focus: null,
      }],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
  },
});

test("builds the classic export without splitting complete skill names", () => {
  const result = buildClassicDocument({
    sourceTitle: "Иван Иванов.pdf",
    sourceText: "Иван Иванов\nFrontend-разработчик\nReact TypeScript REST API Next.js App/Pages Router",
    payload,
  });

  assert.equal(result.sourceTitle, "Иван Иванов");
  assert.equal(result.name, "Иван Иванов");
  assert.ok(result.skills.includes("REST API"));
  assert.ok(result.skills.includes("Next.js App/Pages Router"));
  assert.equal(result.adaptation.adaptedResume.experience[0]?.company, "Сбер");
});

test("rejects oversized classic-export collections", () => {
  const result = classicExportSchema.safeParse({
    ...payload,
    adaptation: {
      ...payload.adaptation,
      adaptedResume: {
        ...payload.adaptation.adaptedResume,
        skills: {
          ...payload.adaptation.adaptedResume.skills,
          primary: Array.from({ length: 101 }, (_, index) => `Skill ${index}`),
        },
      },
    },
  });

  assert.equal(result.success, false);
});

test("rejects non-raster photo payloads before PDFKit", () => {
  const result = classicExportSchema.safeParse({
    ...payload,
    photoUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
  });

  assert.equal(result.success, false);
});

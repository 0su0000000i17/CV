import assert from "node:assert/strict";
import test from "node:test";

import { buildClassicDocument } from "../document.js";
import { renderClassicResumePdf } from "../render-pdf.js";
import { classicExportSchema } from "../schema.js";

const generatedSkills = Array.from(
  { length: 176 },
  (_, index) => `Technology${String(index + 1).padStart(3, "0")}ExtendedStack`,
);

test("paginates a large skill collection without dropping complete names", async () => {
  const payload = classicExportSchema.parse({
    sourceTitle: "Pagination.pdf",
    contacts: { fullName: "PDF Verification" },
    adaptation: {
      target: {
        title: "Frontend developer",
        company: null,
        seniority: null,
        keywordsUsed: [],
      },
      adaptedResume: {
        headline: "Frontend developer",
        summary: "Pagination verification.",
        skills: {
          primary: ["REST API", "Next.js App/Pages Router", ...generatedSkills.slice(0, 98)],
          secondary: generatedSkills.slice(98),
          deprioritized: [],
        },
        experience: [],
        education: { policy: "unchanged", notes: [] },
        additionalInfo: [],
      },
    },
  });
  const document = buildClassicDocument({
    sourceTitle: payload.sourceTitle,
    sourceText: "PDF Verification\nFrontend developer\nREST API\nNext.js App/Pages Router",
    payload,
  });

  assert.equal(document.skills.length, generatedSkills.length + 2);
  assert.ok(document.skills.includes(generatedSkills.at(-1) ?? ""));

  const pdf = await renderClassicResumePdf(document);
  const pageCount = pdf.toString("latin1").match(/\/Type\s*\/Page\b/gu)?.length ?? 0;
  assert.ok(pageCount >= 2);
});

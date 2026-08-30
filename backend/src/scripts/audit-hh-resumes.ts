import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import { extractHhResume } from "../resume-processing/extract-hh-resume.js";

const fixturesDir = process.argv[2] || process.env.HH_RESUME_FIXTURES_DIR;
const durationPattern = /^\d+\s+(?:год|года|лет|месяц|месяца|месяцев)(?:\s+\d+\s+(?:месяц|месяца|месяцев))?$/iu;
const yearOnlyPattern = /^\d{4}$/u;

function clean(value?: string | null) {
  return String(value || "").replace(/\s+/gu, " ").trim();
}

function blockText(block: { type: string; text?: string; title?: string; raw?: string }) {
  return clean(block.text || block.title || block.raw);
}

async function auditFile(filePath: string) {
  const extraction = await extractHhResume({
    fileBuffer: await readFile(filePath),
    mimeType: "application/pdf",
  });
  const document = extraction.document;
  const editable = sourceDocumentToEditableResume(document);
  const issues: string[] = [];

  if (document.meta.parser !== "hh_layout_v1") issues.push("wrong parser marker");
  if (!clean(document.personal.fullName)) issues.push("missing full name");
  if (!clean(document.target.title)) issues.push("missing target title");
  if (extraction.stats.experienceItems !== document.experience.items.length) {
    issues.push(`experience mismatch ${extraction.stats.experienceItems}/${document.experience.items.length}`);
  }
  if (editable.resumeJson.adaptedResume.experience.length !== document.experience.items.length) {
    issues.push("editable experience count mismatch");
  }

  document.experience.items.forEach((item, index) => {
    if (!clean(item.dates.start)) issues.push(`experience ${index + 1}: missing start date`);
    if (!clean(item.position)) issues.push(`experience ${index + 1}: missing position`);
    const misplaced = item.blocks.map(blockText).filter((value) =>
      durationPattern.test(value) || yearOnlyPattern.test(value)
    );
    if (misplaced.length) issues.push(`experience ${index + 1}: date metadata in description`);
    if (item.company.industries.some((value) => durationPattern.test(clean(value)))) {
      issues.push(`experience ${index + 1}: duration in company metadata`);
    }
    if (item.blocks.some((block) => !block.sourceLineIds?.length)) {
      issues.push(`experience ${index + 1}: block without layout provenance`);
    }
  });

  if (document.additional.about.some((value) => /Резюме обновлено/iu.test(value))) {
    issues.push("service footer in about section");
  }

  return {
    file: path.basename(filePath),
    pages: extraction.stats.pages,
    experience: document.experience.items.length,
    education: document.education.items.length,
    courses: document.courses.items.length,
    languages: document.skills.languages.length,
    skills: document.skills.items.length,
    aboutParagraphs: document.additional.about.length,
    issues,
  };
}

async function main() {
  if (!fixturesDir) {
    throw new Error("Pass the HH PDF directory as the first argument or HH_RESUME_FIXTURES_DIR");
  }

  const names = (await readdir(fixturesDir))
    .filter((name) => name.toLocaleLowerCase("ru-RU").endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b, "ru-RU"));
  if (!names.length) throw new Error("No PDF fixtures found");

  const results: Array<Awaited<ReturnType<typeof auditFile>>> = [];
  for (const name of names) {
    const result = await auditFile(path.join(fixturesDir, name));
    results.push(result);
    console.info(JSON.stringify(result));
  }

  const failed = results.filter((result) => result.issues.length);
  console.info(`[hh-audit] ${results.length - failed.length}/${results.length} files passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error("[hh-audit] Failed", error);
  process.exitCode = 1;
});

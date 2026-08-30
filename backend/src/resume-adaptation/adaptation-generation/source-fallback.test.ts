import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitResult } from "../types.js";
import { createSourcePreservingAdaptationOutput } from "./source-fallback.js";

const vacancy: NormalizedVacancy = {
  isVacancy: true, rejectionReason: null, title: "Senior Frontend-разработчик",
  company: "Компания", location: null, salary: null, employment: null,
  workFormat: null, schedule: null, seniority: "Senior", summary: null,
  responsibilities: [], requirements: ["GraphQL"], niceToHave: [], conditions: [],
  skills: ["GraphQL"], warnings: [], confidence: 1,
};

const fit: ResumeVacancyFitResult = {
  canAdapt: true, fit: "partial", score: 60, confidence: 0.5,
  resumeRole: "Frontend-разработчик", vacancyRole: vacancy.title,
  careerMove: "stretch_role", adaptationMode: "limited", reason: "Частичное совпадение",
  safeAdaptationDirection: null, matchedRequirements: [], transferableExperience: [],
  gaps: ["GraphQL"], blockingGaps: [], allowedChanges: [], forbiddenChanges: [], riskFlags: [],
};

test("returns a usable source-preserving adaptation when both model attempts fail", () => {
  const resumeJson = JSON.stringify({
    target: { title: "Frontend-разработчик" },
    additional: { about: "Разрабатываю интерфейсы." },
  });
  const output = createSourcePreservingAdaptationOutput({
    request: {
      resumeMarkdown: resumeJson, vacancy, fit,
      settings: {
        preserveAuthorStyle: true, strengthenAchievements: true,
        optimizeForAts: true, tailorSkillsToVacancy: true, makeTextMoreSpecific: true,
      },
    },
    resumeJson,
    vacancyChars: 100,
  });
  assert.equal(output.generation.provider, "deterministic-fallback");
  assert.equal(output.adaptation.target.title, vacancy.title);
  assert.equal(output.adaptation.adaptedResume.summary, "Разрабатываю интерфейсы.");
  assert.ok(output.adaptation.adaptedResume.skills.notAdded.includes("GraphQL"));
});

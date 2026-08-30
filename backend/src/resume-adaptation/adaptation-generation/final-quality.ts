import type { ResumeAdaptationResult } from "../types.js";
import {
  findNarrativeQualityIssues,
  getAdvisoryNarrativeIssues,
  getBlockingNarrativeIssues,
} from "./narrative-quality-check.js";

function sourceSummary(resumeJson: string) {
  try {
    const parsed = JSON.parse(resumeJson) as {
      additional?: { about?: unknown };
      target?: { title?: unknown };
    };
    const about = Array.isArray(parsed.additional?.about)
      ? parsed.additional.about.filter((item): item is string => typeof item === "string").join(" ")
      : typeof parsed.additional?.about === "string" ? parsed.additional.about : "";
    if (about.trim()) return about.trim();
    return typeof parsed.target?.title === "string" ? parsed.target.title.trim() : "";
  } catch {
    return "";
  }
}

export function ensureFinalNarrativeQuality(
  resumeJson: string,
  adaptation: ResumeAdaptationResult,
) {
  const issues = findNarrativeQualityIssues(resumeJson, adaptation);
  const blocking = getBlockingNarrativeIssues(issues);
  const advisory = getAdvisoryNarrativeIssues(issues);
  if (advisory.length) {
    console.warn("[adaptation] Editorial advisories remain:", advisory.map((issue) => ({
      location: issue.location,
      reason: issue.reason,
    })));
  }
  if (!blocking.length) return adaptation;
  console.warn("[adaptation] Unsafe generated summary was replaced with source text:",
    blocking.map((issue) => ({ location: issue.location, reason: issue.reason })));
  return {
    ...adaptation,
    adaptedResume: {
      ...adaptation.adaptedResume,
      summary: sourceSummary(resumeJson) || adaptation.adaptedResume.headline,
    },
    warnings: Array.from(new Set([
      ...adaptation.warnings,
      "Сгенерированный раздел «Обо мне» не прошёл внутреннюю проверку и был сохранён из исходного резюме.",
    ])),
  };
}

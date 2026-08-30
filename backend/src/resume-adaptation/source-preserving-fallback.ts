import type { ResumeAdaptationResult } from "./types.js";

type SourceResumePayload = {
  target?: {
    title?: unknown;
    salary?: unknown;
    specializations?: unknown;
    employment?: unknown;
    schedule?: unknown;
    workFormat?: unknown;
    commuteTime?: unknown;
  };
  additional?: { about?: unknown };
};

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function textList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
      .map((item) => item.trim()).filter(Boolean)
    : [];
}

export function createSourcePreservingResumeFallback(
  resumeJson: string,
): ResumeAdaptationResult {
  let source: SourceResumePayload = {};
  try {
    source = JSON.parse(resumeJson) as SourceResumePayload;
  } catch {
    // The controller reapplies the canonical source document after generation.
  }
  const title = optionalText(source.target?.title);
  return {
    target: {
      title, company: null, seniority: null,
      salary: optionalText(source.target?.salary),
      specializations: textList(source.target?.specializations),
      employment: optionalText(source.target?.employment),
      schedule: optionalText(source.target?.schedule),
      workFormat: optionalText(source.target?.workFormat),
      commuteTime: optionalText(source.target?.commuteTime),
      keywordsUsed: [],
    },
    adaptedResume: {
      headline: title || "",
      summary: optionalText(source.additional?.about) || "",
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
    changes: [],
    warnings: [
      "Автоматическая редактура не прошла внутреннюю проверку, поэтому исходные формулировки сохранены без рискованных изменений.",
    ],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

const RED_FLAG_TYPES = [
  "role_mismatch",
  "inflated_level",
  "career_transition",
  "weak_evidence",
  "generic_responsibilities",
  "keyword_stuffing",
  "poor_ats",
  "unclear_positioning",
  "missing_metrics",
  "low_scanability",
  "overlong_resume",
  "inconsistent_titles",
] as const;

const TYPE_ALIASES: Record<string, (typeof RED_FLAG_TYPES)[number]> = {
  role_mismatches: "role_mismatch",
  role_mismatch_detected: "role_mismatch",
  level_inflation: "inflated_level",
  inflated_seniority: "inflated_level",
  weak_evidences: "weak_evidence",
  weak_proof: "weak_evidence",
  generic: "generic_responsibilities",
  generic_responsibility: "generic_responsibilities",
  keyword_stuff: "keyword_stuffing",
  poor_ats_compatibility: "poor_ats",
  ats_issue: "poor_ats",
  ats_issues: "poor_ats",
  ats: "poor_ats",
  unclear_focus: "unclear_positioning",
  unclear_role: "unclear_positioning",
  missing_metric: "missing_metrics",
  no_metrics: "missing_metrics",
  weak_metrics: "missing_metrics",
  scanability: "low_scanability",
  low_readability: "low_scanability",
  too_long: "overlong_resume",
  long_resume: "overlong_resume",
  inconsistent_title: "inconsistent_titles",
};

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["'`]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-z0-9а-яё]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeRedFlagType(value: unknown) {
  if (typeof value !== "string") {
    return "weak_evidence";
  }

  const key = normalizeKey(value);

  if ((RED_FLAG_TYPES as readonly string[]).includes(key)) {
    return key;
  }

  return TYPE_ALIASES[key] ?? "weak_evidence";
}

export function normalizeRedFlagSeverity(value: unknown) {
  if (typeof value !== "string") {
    return "major";
  }

  const key = normalizeKey(value);

  if (key === "minor" || key === "low" || key === "small") {
    return "minor";
  }

  if (key === "critical" || key === "high" || key === "severe") {
    return "critical";
  }

  return "major";
}
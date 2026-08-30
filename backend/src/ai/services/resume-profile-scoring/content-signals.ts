import { extractExperienceText } from "./experience-text.js";
import { extractSkillTags } from "./skill-tags.js";
import { clampScore, normalizeText } from "./utils.js";
import { METRIC_TOKEN_PATTERN } from "../../../utils/metric-text.js";

const BULLET_START_PATTERN = /^\s*(?:[-–—•*]|\d+[.)])\s+/;

// A bullet is one marker line plus every following line up to the next
// marker - raw PDF-extracted text wraps a single bullet across several
// physical lines (preserving the source PDF's line breaks), so matching only
// the marker line misses metrics that landed on a wrapped continuation line.
function extractBulletChunks(experienceText: string): string[] {
  const parts = experienceText.split(/\n(?=\s*(?:[-–—•*]|\d+[.)])\s+)/);
  return parts.filter((part) => BULLET_START_PATTERN.test(part));
}

// Deterministic, text-derived signals blended into the LLM's coarse
// poor/medium/good buckets in sections.ts - without these, two resumes that
// land in the same bucket score bit-identically no matter how different the
// underlying bullets actually are. Saturation thresholds are starting
// calibrations, tune against real resumes.
export function calculateMetricDensitySignal(resumeMarkdown?: string): number | null {
  const experienceText = extractExperienceText(normalizeText(resumeMarkdown || ""));
  if (!experienceText) return null;

  const bulletChunks = extractBulletChunks(experienceText);
  if (!bulletChunks.length) return null;

  const metricPattern = new RegExp(METRIC_TOKEN_PATTERN.source, METRIC_TOKEN_PATTERN.flags);
  const metricBullets = bulletChunks.filter((chunk) => {
    metricPattern.lastIndex = 0;
    return metricPattern.test(chunk);
  }).length;

  const ratio = metricBullets / bulletChunks.length;
  return clampScore(Math.min(100, ratio * 100 * 2.2));
}

export function calculateSkillsCoverageSignal(resumeMarkdown?: string): number | null {
  const tags = extractSkillTags(resumeMarkdown || "");
  if (!tags.length) return null;

  return clampScore(Math.min(100, tags.length * 6));
}

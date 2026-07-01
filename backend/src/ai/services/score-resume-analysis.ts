import type {
  AiResumeAnalysis,
  RedFlagSeverity,
  ResumeAnalysis,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../schemas/resume-analysis-schema.js";
import { normalizeResumeAnalysisPresentation } from "./resume-analysis-presentation.js";

type ScoreResumeAnalysisResult = {
  analysis: ResumeAnalysis;
  scoring: {
    baseScore: number;
    finalScore: number;
    appliedCaps: string[];
    profile?: ExperienceProfileDiagnostics | null;
  };
};

type ScoreResumeAnalysisParams = {
  resumeMarkdown?: string;
};

type ExperienceProfileDiagnostics = {
  totalExperienceMonths: number | null;
  experienceWords: number;
  bulletCount: number;
  expectedMinWords: number;
  expectedMaxWords: number;
  expectedMinBullets: number;
  expectedMaxBullets: number;
  disclosure: "too_short" | "balanced" | "too_long" | "unknown";
  score: number;
};

const qualityScores = {
  none: 8,
  weak: 25,
  partial: 48,
  solid: 70,
  strong: 88,
};

const simpleQualityScores = {
  poor: 22,
  medium: 55,
  good: 82,
};

const severityPenalty: Record<RedFlagSeverity, number> = {
  minor: 10,
  major: 22,
  critical: 38,
};

const monthNames: Record<string, number> = {
  январ: 0,
  феврал: 1,
  март: 2,
  апрел: 3,
  ма: 4,
  июн: 5,
  июл: 6,
  август: 7,
  сентябр: 8,
  октябр: 9,
  ноябр: 10,
  декабр: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasFlag(analysis: AiResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

function hasSeverity(
  analysis: AiResumeAnalysis,
  type: ResumeRedFlagType,
  severity: RedFlagSeverity
) {
  return analysis.redFlags.some(
    (flag) => flag.type === type && flag.severity === severity
  );
}

function countSevereFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter(
    (flag) => flag.severity === "major" || flag.severity === "critical"
  ).length;
}

function countCriticalFlags(redFlags: ResumeRedFlag[]) {
  return redFlags.filter((flag) => flag.severity === "critical").length;
}

function calculateCredibility(redFlags: ResumeRedFlag[]) {
  const penalty = redFlags.reduce(
    (sum, flag) => sum + severityPenalty[flag.severity],
    0
  );

  return clampScore(88 - penalty);
}

function countWords(value: string) {
  const matches = value.match(/[\p{L}\p{N}][\p{L}\p{N}_+.#-]*/gu);
  return matches?.length || 0;
}

function countBullets(value: string) {
  const matches = value.match(/^\s*(?:[-–—•*]|\d+[.)])\s+\S/gm);
  return matches?.length || 0;
}

function normalizeText(value: string) {
  return value.replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
}

function extractExperienceText(resumeMarkdown?: string) {
  const text = normalizeText(resumeMarkdown || "");
  if (!text) return "";

  const startMatch = text.search(/опыт\s+работы|work\s+experience|experience/iu);
  if (startMatch === -1) return text;

  const rest = text.slice(startMatch);
  const endMatch = rest.search(
    /\n\s*(?:образование|education|ключевые\s+навыки|навыки|skills|обо\s+мне|about|дополнительн|сертификат|курсы)\b/iu
  );

  return endMatch === -1 ? rest : rest.slice(0, endMatch);
}

function parseDeclaredExperienceMonths(text: string) {
  const match = text.match(
    /(?:опыт\s+работы|experience)\s*[—:\-–]?\s*(?:(\d+)\s*(?:год(?:а|ов)?|лет|years?))?\s*(?:(\d+)\s*(?:месяц(?:а|ев)?|months?))?/iu
  );

  if (!match) return null;

  const years = Number(match[1] || 0);
  const months = Number(match[2] || 0);
  const total = years * 12 + months;

  return total > 0 ? total : null;
}

function getMonthIndex(rawMonth?: string | null) {
  if (!rawMonth) return 0;

  const normalizedMonth = rawMonth.toLowerCase().replace(/[^\p{L}]/gu, "");
  const key = Object.keys(monthNames).find((candidate) =>
    normalizedMonth.startsWith(candidate)
  );

  return key ? monthNames[key] : 0;
}

function parseDatePoint(value: string, fallbackMonth: number) {
  const yearMatch = value.match(/(?:19|20)\d{2}/u);
  if (!yearMatch) return null;

  const monthMatch = value.match(/[A-Za-zА-Яа-яЁё]+/u);
  const year = Number(yearMatch[0]);
  const month = getMonthIndex(monthMatch?.[0]) || fallbackMonth;

  return { year, month };
}

function monthIndex(point: { year: number; month: number }) {
  return point.year * 12 + point.month;
}

function estimateExperienceMonthsFromDateRanges(text: string) {
  const ranges: Array<{ start: number; end: number }> = [];
  const now = new Date();
  const current = now.getFullYear() * 12 + now.getMonth();
  const dateRangePattern =
    /((?:[A-Za-zА-Яа-яЁё]+\s+)?(?:19|20)\d{2})\s*[—–-]\s*((?:[A-Za-zА-Яа-яЁё]+\s+)?(?:19|20)\d{2}|настоящее\s+время|по\s+настоящее|present|current)/giu;

  for (const match of text.matchAll(dateRangePattern)) {
    const start = parseDatePoint(match[1], 0);
    const endRaw = match[2];
    const end = /настоящее|present|current/iu.test(endRaw)
      ? { year: now.getFullYear(), month: now.getMonth() }
      : parseDatePoint(endRaw, 11);

    if (!start || !end) continue;

    const startIndex = monthIndex(start);
    const endIndex = Math.min(monthIndex(end), current);

    if (endIndex >= startIndex) {
      ranges.push({ start: startIndex, end: endIndex });
    }
  }

  if (!ranges.length) return null;

  const sortedRanges = ranges.sort((a, b) => a.start - b.start);
  const mergedRanges: Array<{ start: number; end: number }> = [];

  for (const range of sortedRanges) {
    const lastRange = mergedRanges[mergedRanges.length - 1];

    if (!lastRange || range.start > lastRange.end + 1) {
      mergedRanges.push({ ...range });
      continue;
    }

    lastRange.end = Math.max(lastRange.end, range.end);
  }

  return mergedRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0);
}

function getExperienceExpectations(months: number | null) {
  if (months === null) {
    return {
      minWords: 260,
      targetWords: 520,
      maxWords: 1_100,
      minBullets: 4,
      maxBullets: 18,
    };
  }

  const years = months / 12;

  if (years < 1) {
    return { minWords: 120, targetWords: 240, maxWords: 520, minBullets: 2, maxBullets: 9 };
  }

  if (years < 3) {
    return { minWords: 220, targetWords: 430, maxWords: 850, minBullets: 4, maxBullets: 14 };
  }

  if (years < 5) {
    return { minWords: 340, targetWords: 650, maxWords: 1_200, minBullets: 6, maxBullets: 20 };
  }

  if (years < 8) {
    return { minWords: 480, targetWords: 850, maxWords: 1_550, minBullets: 8, maxBullets: 26 };
  }

  return { minWords: 620, targetWords: 1_050, maxWords: 1_900, minBullets: 10, maxBullets: 32 };
}

function calculateDisclosureScore(params: {
  words: number;
  bullets: number;
  totalExperienceMonths: number | null;
}) {
  const expectations = getExperienceExpectations(params.totalExperienceMonths);
  const words = params.words;
  const bullets = params.bullets;
  let score = 86;
  let disclosure: ExperienceProfileDiagnostics["disclosure"] = "balanced";

  if (words < expectations.minWords) {
    const ratio = words / expectations.minWords;
    disclosure = "too_short";

    if ((params.totalExperienceMonths || 0) >= 60 && ratio < 0.65) {
      score = 50;
    } else if (ratio < 0.55) {
      score = 48;
    } else if (ratio < 0.8) {
      score = 60;
    } else {
      score = 70;
    }
  } else if (words > expectations.maxWords) {
    const ratio = words / expectations.maxWords;
    disclosure = "too_long";
    score = ratio > 1.5 ? 54 : ratio > 1.25 ? 62 : 70;
  }

  if (bullets > 0 && bullets < expectations.minBullets) {
    score = Math.min(score, (params.totalExperienceMonths || 0) >= 60 ? 58 : 66);
    disclosure = disclosure === "too_long" ? disclosure : "too_short";
  }

  if (bullets > expectations.maxBullets) {
    score = Math.min(score, 68);
    disclosure = "too_long";
  }

  if (bullets > 0) {
    const wordsPerBullet = words / bullets;

    if (wordsPerBullet < 9) {
      score = Math.min(score, 66);
    }

    if (wordsPerBullet > 70 && bullets >= expectations.minBullets) {
      score = Math.min(score, 72);
    }
  }

  return {
    ...expectations,
    disclosure,
    score: clampScore(score),
  };
}

function buildExperienceProfileDiagnostics(resumeMarkdown?: string): ExperienceProfileDiagnostics | null {
  const normalized = normalizeText(resumeMarkdown || "");
  if (!normalized) return null;

  const experienceText = extractExperienceText(normalized);
  const declaredMonths = parseDeclaredExperienceMonths(normalized);
  const estimatedMonths = estimateExperienceMonthsFromDateRanges(experienceText);
  const totalExperienceMonths = declaredMonths ?? estimatedMonths;
  const experienceWords = countWords(experienceText);
  const bulletCount = countBullets(experienceText);
  const disclosure = calculateDisclosureScore({
    words: experienceWords,
    bullets: bulletCount,
    totalExperienceMonths,
  });

  return {
    totalExperienceMonths,
    experienceWords,
    bulletCount,
    expectedMinWords: disclosure.minWords,
    expectedMaxWords: disclosure.maxWords,
    expectedMinBullets: disclosure.minBullets,
    expectedMaxBullets: disclosure.maxBullets,
    disclosure: disclosure.disclosure,
    score: disclosure.score,
  };
}

function calculateSections(
  analysis: AiResumeAnalysis,
  params: ScoreResumeAnalysisParams = {}
): ResumeAnalysis["sections"] {
  let positioning = simpleQualityScores[analysis.positioningQuality];
  let roleFit = qualityScores[analysis.relevantExperience];
  let experience = qualityScores[analysis.relevantExperience];
  let evidence = simpleQualityScores[analysis.evidenceQuality];
  let scanability = simpleQualityScores[analysis.scanability];
  let ats = simpleQualityScores[analysis.atsCompatibility];
  let credibility = calculateCredibility(analysis.redFlags);
  const profileDiagnostics = buildExperienceProfileDiagnostics(params.resumeMarkdown);

  if (profileDiagnostics) {
    scanability = clampScore(scanability * 0.35 + profileDiagnostics.score * 0.65);
  }

  if (hasFlag(analysis, "role_mismatch")) {
    positioning = Math.min(positioning, 42);
    roleFit = Math.min(roleFit, 38);
    ats = Math.min(ats, 55);
    credibility = Math.min(credibility, 50);
  }

  if (hasFlag(analysis, "inflated_level")) {
    roleFit = Math.min(roleFit, 42);
    experience = Math.min(experience, 50);
    credibility = Math.min(credibility, 55);
  }

  if (hasFlag(analysis, "career_transition")) {
    roleFit = Math.min(roleFit, 52);
    experience = Math.min(experience, 55);
    positioning = Math.min(positioning, 60);
  }

  if (hasFlag(analysis, "weak_evidence")) {
    evidence = Math.min(evidence, 38);
    experience = Math.min(experience, 58);
    credibility = Math.min(credibility, 58);
  }

  if (hasFlag(analysis, "missing_metrics")) {
    evidence = Math.min(evidence, 40);
    experience = Math.min(experience, 62);
  }

  if (hasFlag(analysis, "generic_responsibilities")) {
    evidence = Math.min(evidence, 45);
    scanability = Math.min(scanability, 62);
  }

  if (hasFlag(analysis, "keyword_stuffing")) {
    ats = Math.min(ats, 55);
    credibility = Math.min(credibility, 58);
  }

  if (hasFlag(analysis, "poor_ats")) {
    ats = Math.min(ats, 40);
  }

  if (hasFlag(analysis, "unclear_positioning")) {
    positioning = Math.min(positioning, 42);
    scanability = Math.min(scanability, 52);
  }

  if (hasFlag(analysis, "low_scanability") || hasFlag(analysis, "overlong_resume")) {
    scanability = Math.min(scanability, 62);
    ats = Math.min(ats, 62);
  }

  return {
    positioning: clampScore(positioning),
    roleFit: clampScore(roleFit),
    experience: clampScore(experience),
    evidence: clampScore(evidence),
    scanability: clampScore(scanability),
    ats: clampScore(ats),
    credibility: clampScore(credibility),
  };
}

function calculateWeightedScore(sections: ResumeAnalysis["sections"]) {
  return clampScore(
    sections.positioning * 0.14 +
      sections.roleFit * 0.2 +
      sections.experience * 0.18 +
      sections.evidence * 0.2 +
      sections.scanability * 0.1 +
      sections.ats * 0.1 +
      sections.credibility * 0.08
  );
}

function applyCaps(analysis: AiResumeAnalysis, score: number) {
  let finalScore = score;
  const appliedCaps: string[] = [];

  function cap(maxScore: number, reason: string) {
    if (finalScore > maxScore) {
      finalScore = maxScore;
      appliedCaps.push(`${reason}:${maxScore}`);
    }
  }

  const severeFlagsCount = countSevereFlags(analysis.redFlags);
  const criticalFlagsCount = countCriticalFlags(analysis.redFlags);

  if (hasFlag(analysis, "role_mismatch") && hasFlag(analysis, "inflated_level")) {
    cap(52, "role_mismatch_and_inflated_level");
  } else if (hasSeverity(analysis, "role_mismatch", "critical")) {
    cap(55, "critical_role_mismatch");
  } else if (hasFlag(analysis, "role_mismatch")) {
    cap(58, "role_mismatch");
  }

  if (hasSeverity(analysis, "inflated_level", "critical")) {
    cap(56, "critical_inflated_level");
  } else if (hasFlag(analysis, "inflated_level")) {
    cap(60, "inflated_level");
  }

  if (hasFlag(analysis, "career_transition")) {
    cap(60, "career_transition");
  }

  if (hasFlag(analysis, "keyword_stuffing") && hasFlag(analysis, "weak_evidence")) {
    cap(56, "keyword_stuffing_and_weak_evidence");
  }

  if (hasFlag(analysis, "weak_evidence") && hasFlag(analysis, "generic_responsibilities")) {
    cap(58, "weak_evidence_and_generic_responsibilities");
  }

  if (hasFlag(analysis, "missing_metrics") && hasFlag(analysis, "generic_responsibilities")) {
    cap(60, "missing_metrics_and_generic_responsibilities");
  } else if (hasFlag(analysis, "missing_metrics")) {
    cap(66, "missing_metrics");
  }

  if (analysis.evidenceQuality === "poor") {
    cap(62, "poor_evidence_quality");
  }

  if (criticalFlagsCount >= 2) {
    cap(48, "two_or_more_critical_flags");
  }

  if (severeFlagsCount >= 4) {
    cap(50, "four_or_more_severe_flags");
  } else if (severeFlagsCount >= 3) {
    cap(55, "three_or_more_severe_flags");
  } else if (severeFlagsCount >= 2) {
    cap(64, "two_or_more_severe_flags");
  }

  if (
    ["middle", "senior", "lead"].includes(analysis.targetLevel) &&
    analysis.relevantExperience !== "solid" &&
    analysis.relevantExperience !== "strong"
  ) {
    cap(58, "middle_plus_without_solid_relevant_experience");
  }

  return {
    score: clampScore(finalScore),
    appliedCaps,
  };
}

export function scoreResumeAnalysis(
  aiAnalysis: AiResumeAnalysis,
  params: ScoreResumeAnalysisParams = {}
): ScoreResumeAnalysisResult {
  const profileDiagnostics = buildExperienceProfileDiagnostics(params.resumeMarkdown);
  const sections = calculateSections(aiAnalysis, params);
  const baseScore = calculateWeightedScore(sections);
  const cappedScore = applyCaps(aiAnalysis, baseScore);

  const analysis = normalizeResumeAnalysisPresentation({
    score: cappedScore.score,
    summary: aiAnalysis.summary,
    targetRole: aiAnalysis.targetRole,
    targetLevel: aiAnalysis.targetLevel,
    recentRoles: aiAnalysis.recentRoles,
    strengths: aiAnalysis.strengths,
    weaknesses: aiAnalysis.weaknesses,
    atsIssues: aiAnalysis.atsIssues,
    recommendations: aiAnalysis.recommendations,
    missingKeywords: aiAnalysis.missingKeywords,
    suggestedHeadline: aiAnalysis.suggestedHeadline,
    redFlags: aiAnalysis.redFlags,
    sections,
  });

  return {
    analysis,
    scoring: {
      baseScore,
      finalScore: cappedScore.score,
      appliedCaps: cappedScore.appliedCaps,
      profile: profileDiagnostics,
    },
  };
}

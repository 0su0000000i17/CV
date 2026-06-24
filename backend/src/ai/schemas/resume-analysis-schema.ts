import { z } from "zod";

import {
  normalizeRedFlagSeverity,
  normalizeRedFlagType,
} from "./red-flag-normalizer.js";

const boundedTextArray = z.array(z.string().trim().min(1)).max(8);

export const targetLevelSchema = z.enum([
  "intern",
  "junior",
  "middle",
  "senior",
  "lead",
  "unknown",
]);

export const qualityLevelSchema = z.enum([
  "none",
  "weak",
  "partial",
  "solid",
  "strong",
]);

export const simpleQualitySchema = z.enum(["poor", "medium", "good"]);

export const resumeRedFlagTypeSchema = z.enum([
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
]);

export const redFlagSeveritySchema = z.enum(["minor", "major", "critical"]);

const normalizedRedFlagTypeSchema = z.preprocess(
  normalizeRedFlagType,
  resumeRedFlagTypeSchema
);

const normalizedRedFlagSeveritySchema = z.preprocess(
  normalizeRedFlagSeverity,
  redFlagSeveritySchema
);

export const resumeRedFlagSchema = z.object({
  type: normalizedRedFlagTypeSchema,
  severity: normalizedRedFlagSeveritySchema,
  explanation: z.string().trim().min(10).max(500),
});

export const aiResumeAnalysisSchema = z.object({
  targetRole: z.string().trim().min(1).max(200),
  targetLevel: targetLevelSchema,
  recentRoles: z.array(z.string().trim().min(1).max(200)).max(6),
  positioningQuality: simpleQualitySchema,
  relevantExperience: qualityLevelSchema,
  evidenceQuality: simpleQualitySchema,
  scanability: simpleQualitySchema,
  atsCompatibility: simpleQualitySchema,
  redFlags: z.array(resumeRedFlagSchema).max(10),
  summary: z.string().trim().min(20).max(1_500),
  strengths: boundedTextArray,
  weaknesses: boundedTextArray,
  atsIssues: boundedTextArray,
  recommendations: boundedTextArray,
  missingKeywords: boundedTextArray,
  suggestedHeadline: z.string().trim().min(1).max(300),
});

export type TargetLevel = z.infer<typeof targetLevelSchema>;
export type QualityLevel = z.infer<typeof qualityLevelSchema>;
export type SimpleQuality = z.infer<typeof simpleQualitySchema>;
export type ResumeRedFlagType = z.infer<typeof resumeRedFlagTypeSchema>;
export type RedFlagSeverity = z.infer<typeof redFlagSeveritySchema>;
export type ResumeRedFlag = z.infer<typeof resumeRedFlagSchema>;
export type AiResumeAnalysis = z.infer<typeof aiResumeAnalysisSchema>;

export type ResumeAnalysis = {
  score: number;
  summary: string;
  targetRole: string;
  targetLevel: TargetLevel;
  recentRoles: string[];
  strengths: string[];
  weaknesses: string[];
  atsIssues: string[];
  recommendations: string[];
  missingKeywords: string[];
  suggestedHeadline: string;
  redFlags: ResumeRedFlag[];
  sections: {
    positioning: number;
    roleFit: number;
    experience: number;
    evidence: number;
    scanability: number;
    ats: number;
    credibility: number;
  };
};
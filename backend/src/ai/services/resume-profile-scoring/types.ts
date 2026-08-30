import type { ResumeAnalysis } from "../../schemas/resume-analysis-schema.js";

export type ScoreResumeAnalysisResult = {
  analysis: ResumeAnalysis;
  scoring: {
    baseScore: number;
    finalScore: number;
    appliedCaps: string[];
    profile?: ExperienceProfileDiagnostics | null;
  };
};

export type ScoreResumeAnalysisParams = {
  resumeMarkdown?: string;
};

export type ExperienceProfileDiagnostics = {
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

export type ExperienceExpectations = {
  minWords: number;
  targetWords: number;
  maxWords: number;
  minBullets: number;
  maxBullets: number;
};

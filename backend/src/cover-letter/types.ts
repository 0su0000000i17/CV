import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";

export type CoverLetterTone =
  | "strict_professional"
  | "friendly_neutral"
  | "confident_short";

export type GenerateCoverLetterParams = {
  resumeMarkdown: string;
  vacancyText: string;
  tone: CoverLetterTone;
  adaptation?: ResumeAdaptationResult;
};

export type GenerateCoverLetterResult = {
  coverLetter: string;
  warnings: string[];
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
    tone: CoverLetterTone;
    usedAdaptation: boolean;
  };
};
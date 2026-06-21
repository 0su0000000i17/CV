import { z } from "zod";

const boundedTextArray = z.array(z.string().trim().min(1)).max(8);

export const resumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),

  summary: z.string().trim().min(20).max(1_500),

  strengths: boundedTextArray,
  weaknesses: boundedTextArray,
  atsIssues: boundedTextArray,
  recommendations: boundedTextArray,
  missingKeywords: boundedTextArray,

  suggestedHeadline: z.string().trim().min(1).max(300),

  sections: z.object({
    structure: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    skills: z.number().min(0).max(100),
    ats: z.number().min(0).max(100),
  }),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
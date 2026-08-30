import assert from "node:assert/strict";
import test from "node:test";

import {
  aiResumeAnalysisSchema,
  type AiResumeAnalysis,
} from "../schemas/resume-analysis-schema.js";
import { createAnalyzeResumeUserPrompt } from "../prompts/analyze-resume-prompt.js";
import { scoreResumeAnalysis } from "./score-resume-analysis.js";

function createAnalysis(
  quality: AiResumeAnalysis["positioningQuality"]
): AiResumeAnalysis {
  return {
    targetRole: "Product designer",
    targetLevel: "middle",
    recentRoles: ["Product designer"],
    positioningQuality: quality,
    relevantExperience: "strong",
    evidenceQuality: quality,
    scanability: quality,
    atsCompatibility: quality,
    redFlags: [],
    summary: "Позиционирование подтверждено опытом и результатами.",
    strengths: ["Релевантный опыт"],
    weaknesses: [],
    atsIssues: [],
    recommendations: [],
    missingKeywords: [],
    suggestedHeadline: "Middle Product Designer",
  };
}

test("accepts excellent quality and scores it above good", () => {
  const excellent = createAnalysis("excellent");
  assert.equal(aiResumeAnalysisSchema.safeParse(excellent).success, true);

  const goodScore = scoreResumeAnalysis(createAnalysis("good")).analysis.score;
  const excellentScore = scoreResumeAnalysis(excellent).analysis.score;

  assert.ok(excellentScore > goodScore);
});

test("adds prior assessment only for a changed-resume comparison", () => {
  const previousAssessment = {
    score: 87,
    analysis: createAnalysis("good"),
  };

  const comparisonPrompt = createAnalyzeResumeUserPrompt(
    "ТЕКУЩЕЕ РЕЗЮМЕ",
    previousAssessment
  );
  const firstAssessmentPrompt = createAnalyzeResumeUserPrompt(
    "ТЕКУЩЕЕ РЕЗЮМЕ"
  );

  assert.match(comparisonPrompt, /КОНТЕКСТ ПОВТОРНОЙ ОЦЕНКИ/);
  assert.match(comparisonPrompt, /"previousScore": 87/);
  assert.match(comparisonPrompt, /не повышай их только из-за факта улучшения/);
  assert.doesNotMatch(firstAssessmentPrompt, /previousScore/);
});

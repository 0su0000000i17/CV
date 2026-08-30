import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";

export function adaptation(bullets: string[]): ResumeAdaptationResult {
  return {
    target: { title: null, company: null, seniority: null, keywordsUsed: [] },
    adaptedResume: {
      headline: "Специалист",
      summary: "Развиваюсь в своей профессиональной области.",
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [
        {
          sourceIndex: 0,
          company: "Альфа",
          position: "Специалист",
          dates: null,
          adaptedBullets: bullets,
          focus: null,
          preservedFacts: [],
          warnings: [],
        },
      ],
      education: { policy: "unchanged", notes: [] },
      additionalInfo: [],
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

export function resumeJson(sourceBullet: string) {
  return JSON.stringify({
    experience: {
      items: [{
        sourceIndex: 0,
        company: { name: "Альфа" },
        blocks: [{ type: "bullet", text: sourceBullet }],
      }],
    },
  });
}

export function fact(params: {
  id: string;
  topic: string;
  question: string;
  answer: string;
}) {
  return `[В ОПЫТ sourceIndex 0] [FACT questionId=${params.id}; kind=experience; purpose=evidence; topic=${params.topic}; integration=atomic] ${params.question} -> ${params.answer}`;
}

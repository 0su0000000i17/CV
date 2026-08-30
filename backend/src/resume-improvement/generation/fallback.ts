import { createSourcePreservingImprovementFallback } from "../source-preserving-fallback.js";

export function improvementFallback(resumeJson: string) {
  return {
    improvement: createSourcePreservingImprovementFallback(resumeJson),
    generation: {
      provider: "deterministic-fallback",
      model: "source-preservation-v1",
    },
    meta: { resumeChars: resumeJson.length },
  };
}

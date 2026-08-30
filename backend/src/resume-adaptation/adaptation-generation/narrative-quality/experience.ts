import type { ResumeAdaptationResult } from "../../types.js";
import { narrativeSimilarity } from "./text.js";
import type { NarrativeQualityIssue, NarrativeSourcePayload } from "./types.js";

export function findExperienceRewriteIssues(
  source: NarrativeSourcePayload,
  adaptation: ResumeAdaptationResult
): NarrativeQualityIssue[] {
  const issues: NarrativeQualityIssue[] = [];
  const adaptedByIndex = new Map(
    adaptation.adaptedResume.experience.map((item) => [item.sourceIndex, item])
  );
  (source.experience?.items || []).forEach((item, fallbackIndex) => {
    const sourceIndex =
      typeof item.sourceIndex === "number" ? item.sourceIndex : fallbackIndex;
    const sourceBullets = (item.blocks || [])
      .filter((block) => block.type === "bullet" && block.text)
      .map((block) => block.text?.trim() || "")
      .filter(Boolean);
    const adaptedBullets = adaptedByIndex.get(sourceIndex)?.adaptedBullets || [];
    if (sourceBullets.length < 3 || adaptedBullets.length < 3) return;
    const nearCopies = adaptedBullets.filter((candidate) =>
      sourceBullets.some((original) => narrativeSimilarity(original, candidate) >= 0.9)
    );
    const comparisonSize = Math.min(sourceBullets.length, adaptedBullets.length);
    if (nearCopies.length >= Math.ceil(comparisonSize * 0.6)) {
      issues.push({
        location: `experience[${sourceIndex}]`,
        reason: `${nearCopies.length} из ${comparisonSize} пунктов сохранили формулировку, близкую к исходной`,
        severity: "advisory",
      });
    }
  });
  return issues;
}

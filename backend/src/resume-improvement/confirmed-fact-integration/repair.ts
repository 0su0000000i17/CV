import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";
import { parseSourceExperience } from "./source-experience.js";
import type { ConfirmedFactIntegrationIssue } from "./types.js";

export function repairConfirmedFactIntegrationIssues(params: {
  resumeJson: string;
  adaptation: ResumeAdaptationResult;
  issues: ConfirmedFactIntegrationIssue[];
}): ResumeAdaptationResult {
  if (!params.issues.length) return params.adaptation;
  const affectedIndexes = new Set(params.issues.map((issue) => issue.sourceIndex));
  const sourceByIndex = new Map(
    parseSourceExperience(params.resumeJson).map((item) => [item.sourceIndex, item])
  );
  const experience = params.adaptation.adaptedResume.experience.map((item) => {
    if (!affectedIndexes.has(item.sourceIndex)) return item;
    const source = sourceByIndex.get(item.sourceIndex);
    if (!source?.bullets.length) {
      const rejectedBullets = new Set(
        params.issues
          .filter((issue) => issue.sourceIndex === item.sourceIndex)
          .map((issue) => issue.bullet)
      );
      return {
        ...item,
        adaptedBullets: item.adaptedBullets.filter(
          (bullet) => !rejectedBullets.has(bullet)
        ),
      };
    }
    return { ...item, adaptedBullets: [...source.bullets] };
  });
  return {
    ...params.adaptation,
    adaptedResume: { ...params.adaptation.adaptedResume, experience },
  };
}

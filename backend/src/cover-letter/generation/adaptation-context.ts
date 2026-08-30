import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";

export function createCoverLetterAdaptationContext(
  adaptation: ResumeAdaptationResult,
) {
  return {
    target: {
      title: adaptation.target.title,
      company: adaptation.target.company,
      seniority: adaptation.target.seniority,
      keywordsUsed: adaptation.target.keywordsUsed,
    },
    adaptedResume: {
      headline: adaptation.adaptedResume.headline,
      summary: adaptation.adaptedResume.summary,
      skills: {
        primary: adaptation.adaptedResume.skills.primary,
        secondary: adaptation.adaptedResume.skills.secondary,
      },
      experience: adaptation.adaptedResume.experience.map((item) => ({
        sourceIndex: item.sourceIndex,
        company: item.company,
        position: item.position,
        focus: item.focus,
        adaptedBullets: item.adaptedBullets,
      })),
      additionalInfo: adaptation.adaptedResume.additionalInfo,
    },
  };
}

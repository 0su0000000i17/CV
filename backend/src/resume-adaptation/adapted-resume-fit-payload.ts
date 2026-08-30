import type { ResumeTextBlock, SourceResumeDocument } from "../resume-document/types.js";
import type { ResumeAdaptationResult } from "./types.js";

function extractStackItems(blocks: ResumeTextBlock[]) {
  return blocks
    .filter((block): block is Extract<ResumeTextBlock, { type: "stack" }> => block.type === "stack")
    .flatMap((block) => block.items);
}

/**
 * Serializes an ADAPTED resume into the same safe-JSON shape the fit check
 * consumes, so the vacancy match can be re-measured after adaptation and
 * shown to the user as "match before -> match after".
 *
 * This must stay structurally comparable to buildResumeAdaptationAiPayload
 * (the BEFORE payload) for sections adaptation never rewrites - education,
 * courses, per-job technology stack. An earlier version collapsed education
 * to just `level`, dropped courses entirely, and exposed only
 * item.adaptedBullets (never the stack line each job still shows in the
 * final rendered resume). The fit model was then scoring the same
 * unchanged content as if it had vanished, which could swing the "after"
 * score below the "before" one for reasons that have nothing to do with the
 * adaptation's actual quality - e.g. a vacancy requiring a specific
 * institution/field of study, or a stack line the fit model could no
 * longer see. Sections adaptation genuinely rewrites (headline, summary,
 * bullets, skills, additionalInfo) still come from the AI output.
 */
export function stringifyAdaptedResumeForFit(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}) {
  const { adaptation, sourceDocument } = params;
  const draft = adaptation.adaptedResume;
  const sourceExperienceByIndex = new Map(
    sourceDocument.experience.items.map((item) => [item.sourceIndex, item])
  );

  return JSON.stringify(
    {
      personal: {
        gender: sourceDocument.personal.gender,
      },
      target: {
        title: adaptation.target.title || draft.headline || null,
      },
      headline: draft.headline || null,
      summary: draft.summary || null,
      experience: {
        total: sourceDocument.experience.total,
        items: draft.experience.map((item) => ({
          sourceIndex: item.sourceIndex,
          company: { name: item.company },
          position: item.position,
          dates: { start: null, end: null, duration: item.dates },
          focus: item.focus,
          bullets: item.adaptedBullets,
          stack: extractStackItems(sourceExperienceByIndex.get(item.sourceIndex)?.blocks || []),
        })),
      },
      skills: {
        items: [...draft.skills.primary, ...draft.skills.secondary],
        languages: sourceDocument.skills.languages.map((item) => ({
          name: item.name,
          level: item.level,
        })),
      },
      education: {
        level: sourceDocument.education.level,
        items: sourceDocument.education.items.map((item) => ({
          year: item.year,
          level: item.level,
          institution: item.institution,
          faculty: item.faculty,
          specialization: item.specialization,
        })),
        notes: draft.education.notes,
      },
      courses: {
        items: sourceDocument.courses.items.map((item) => ({
          year: item.year,
          title: item.title,
          organization: item.organization,
        })),
      },
      additional: {
        about: draft.additionalInfo,
      },
    },
    null,
    2
  );
}

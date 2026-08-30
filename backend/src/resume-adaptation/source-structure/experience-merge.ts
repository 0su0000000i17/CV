import type { ResumeTextBlock } from "../../resume-document/types.js";
import { mergeBullets, mergeFocus, mergePreservedFacts } from "./bullet-merge.js";
import { mergeExperienceDescription } from "./experience-description.js";
import { resolvePosition } from "./experience-matching.js";
import type { ExperienceItem, SupportContext } from "./types.js";

export function mergeExperienceItem(
  original: ExperienceItem,
  adapted: ExperienceItem | null,
  context: SupportContext,
  sourceBlocks: ResumeTextBlock[],
): { item: ExperienceItem; metricGaps: string[] } {
  const adaptedBullets = adapted?.adaptedBullets || [];
  const merged = mergeBullets(original.adaptedBullets, adaptedBullets, context);
  const metricGaps = merged.strippedCount
    ? [`Уточните цифру в пункте про «${original.position || original.company || "опыт"}»: добавьте реальное значение вместо убранной непроверяемой цифры, чтобы усилить доказательность.`]
    : [];
  return {
    item: {
      sourceIndex: original.sourceIndex,
      company: original.company,
      companyCity: original.companyCity,
      companyUrl: original.companyUrl,
      companyIndustries: original.companyIndustries,
      position: resolvePosition(original, adapted),
      dates: original.dates,
      description: mergeExperienceDescription(
        sourceBlocks,
        adaptedBullets.length ? merged.bullets : [],
        adapted?.description || original.description,
      ),
      adaptedBullets: merged.bullets,
      focus: mergeFocus(original.focus, adapted?.focus, context),
      preservedFacts: mergePreservedFacts(original, adapted, context),
      warnings: adapted?.warnings || [],
    },
    metricGaps,
  };
}

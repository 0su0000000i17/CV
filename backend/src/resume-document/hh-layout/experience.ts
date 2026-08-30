import { getHhExperienceLayoutItems } from "../../resume-processing/pdf-layout/hh-reading-order.js";
import type { PdfLayoutDocument } from "../../resume-processing/pdf-layout/types.js";
import type { SourceResumeDocument } from "../types.js";
import { createLayoutBlocks } from "./experience-blocks.js";

export function layoutExperience(
  layout: PdfLayoutDocument,
  experience: SourceResumeDocument["experience"],
) {
  const layoutItems = getHhExperienceLayoutItems(layout);
  return {
    ...experience,
    items: experience.items.map((item, index) => {
      const layoutItem = layoutItems[index];
      return layoutItem ? { ...item, blocks: createLayoutBlocks(layoutItem, item, index) } : item;
    }),
  };
}

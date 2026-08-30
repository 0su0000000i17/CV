import type { ResumeTextBlock, SourceResumeDocument } from "../../resume-document/types.js";
import { experienceDescription, splitExperienceBlocks } from "./experience-description.js";
import { resolveExperienceConstants, resolveRawPosition } from "./experience-metadata.js";
import { cleanList, removeExactLines, text } from "./text.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

function formatDates(item: ExperienceItem["dates"]) {
  return [item.start, item.end].map(text).filter(Boolean).join(" — ") || null;
}

export function toExperienceItem(item: ExperienceItem, index: number) {
  const split = splitExperienceBlocks(item.blocks);
  const position = text(item.position) || resolveRawPosition(item);
  const constants = resolveExperienceConstants(item, position);
  const company = text(item.company.name) || constants.company;
  const blockedLines = [position, company, ...constants.metaLines];
  const filteredFocus = removeExactLines(split.focus, blockedLines);
  const sourceBullets = item.blocks
    .filter((block): block is Extract<ResumeTextBlock, { type: "bullet" }> =>
      block.type === "bullet")
    .map((block) => block.text);
  const filteredBullets = removeExactLines(sourceBullets, blockedLines);
  return {
    sourceIndex: Number.isFinite(item.sourceIndex) ? item.sourceIndex : index,
    company: company || null,
    companyCity: text(item.company.city) || null,
    companyUrl: text(item.company.url) || null,
    companyIndustries: cleanList(item.company.industries),
    position: position || null,
    dates: formatDates(item.dates),
    description: experienceDescription(item.blocks),
    adaptedBullets: filteredBullets,
    focus: cleanList(filteredFocus).join("\n") || null,
    preservedFacts: filteredBullets.slice(0, 16),
    warnings: [],
  };
}

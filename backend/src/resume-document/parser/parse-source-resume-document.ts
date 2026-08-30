import {
  SOURCE_RESUME_DOCUMENT_VERSION,
  type SourceResumeDocument,
} from "../types.js";
import {
  parseAdditionalParagraphs,
  parseAdditionalSection,
} from "./legacy/additional-section.js";
import { splitEducationCarryoverFromSkills } from "./legacy/education-carryover.js";
import { parseEducationSection } from "./legacy/education-section.js";
import { parseExperienceSection } from "./legacy/experience-section.js";
import {
  extractUpdatedAtRaw,
  isIgnoredVisualElement,
  isServiceLine,
  looksLikeHhResume,
  parseLines,
} from "./legacy/line-utils.js";
import { parsePersonalSection } from "./legacy/personal-section.js";
import {
  parseSkillsSection,
  reconcileEducationAndSkills,
} from "./legacy/skills-section.js";
import { parseTargetSection } from "./legacy/target-section.js";
import { splitResumeSections } from "./section-splitter.js";

export function parseSourceResumeDocument(markdown: string): SourceResumeDocument {
  const lines = parseLines(markdown);
  const sections = splitResumeSections(lines);
  const personal = parsePersonalSection(sections.headerLines);
  const target = parseTargetSection(sections.targetLines);
  const experience = parseExperienceSection(sections.experienceLines);
  const skillsSplit = splitEducationCarryoverFromSkills(
    sections.educationLines,
    sections.skillsLines,
  );
  const educationResult = parseEducationSection([
    ...sections.educationLines,
    ...skillsSplit.educationLines,
  ]);
  const parsedSkills = parseSkillsSection(skillsSplit.skillsLines);
  const skills = reconcileEducationAndSkills(
    educationResult.education,
    educationResult.courses,
    parsedSkills,
  );
  const additional = parseAdditionalSection(
    sections.additionalLines,
    parseAdditionalParagraphs(markdown),
  );
  return {
    version: SOURCE_RESUME_DOCUMENT_VERSION,
    source: looksLikeHhResume(lines) ? "hh_pdf" : "generic_resume",
    meta: {
      sectionOrder: sections.sectionOrder,
      serviceLines: lines.filter(isServiceLine),
      ignoredVisualElements: lines.filter(isIgnoredVisualElement),
      updatedAtRaw: extractUpdatedAtRaw(lines),
      parser: "legacy_text_v2",
      layout: null,
    },
    personal,
    target,
    experience,
    education: educationResult.education,
    courses: educationResult.courses,
    skills,
    additional,
    photo: null,
    diagnostics: { warnings: sections.warnings, unknownBlocks: [] },
  };
}

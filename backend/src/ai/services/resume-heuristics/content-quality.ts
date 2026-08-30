import { extractSkillTags } from "../resume-profile-scoring/skill-tags.js";

export function hasUncorroboratedSkillDump(markdown: string) {
  const tags = extractSkillTags(markdown);
  if (tags.length < 30) return false;

  const lowerMarkdown = markdown.toLowerCase();
  const corroborated = tags.filter((tag) => {
    const needle = tag.toLowerCase();
    return lowerMarkdown.indexOf(needle) !== lowerMarkdown.lastIndexOf(needle);
  }).length;
  return corroborated / tags.length < 0.5;
}

const BULLET_MARKER_PATTERN = /^\s*(?:[-–—•*]|\d+[.)])\s+/;

export function hasWallOfText(markdown: string) {
  const parts = markdown.split(/\n(?=\s*(?:[-–—•*]|\d+[.)])\s+)/);
  return parts.some((part) => {
    if (BULLET_MARKER_PATTERN.test(part)) return false;
    return part.split(/\n{2,}|^#{1,6}\s.*$/m).some((block) => {
      const text = block.trim();
      const commaCount = (text.match(/,/g) || []).length;
      return text.length > 900 && commaCount < 15;
    });
  });
}

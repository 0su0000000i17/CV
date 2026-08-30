import { isCourseHeading, isEducationLevelLike, yearMatch } from "./education-utils.js";
import { isServiceLine, normalizeLine } from "./line-utils.js";
import { isSkillsHeadingLine, parseLanguageLine } from "./skill-language.js";

function educationNeedsContinuation(lines: string[]) {
  const cleanLines = lines.map(normalizeLine).filter((line) => line && !isServiceLine(line));
  const courseIndex = cleanLines.findIndex(isCourseHeading);
  const main = cleanLines.slice(0, courseIndex >= 0 ? courseIndex : cleanLines.length);
  const lastYear = main
    .map((line, index) => yearMatch(line) ? index : -1)
    .filter((index) => index >= 0)
    .at(-1);
  return lastYear !== undefined &&
    !main.slice(lastYear + 1).some((line) => !isEducationLevelLike(line));
}

export function splitEducationCarryoverFromSkills(
  educationLines: string[],
  skillsLines: string[],
) {
  if (!educationNeedsContinuation(educationLines)) {
    return { educationLines: [] as string[], skillsLines };
  }
  const heading = skillsLines.findIndex((line) => /^Знание языков$/iu.test(normalizeLine(line)));
  const firstLanguage = skillsLines.findIndex((line, index) =>
    index > heading && Boolean(parseLanguageLine(line)),
  );
  if (heading < 0 || firstLanguage <= heading + 1) {
    return { educationLines: [] as string[], skillsLines };
  }
  const carryover = skillsLines.slice(heading + 1, firstLanguage)
    .map(normalizeLine)
    .filter((line) => line && !isServiceLine(line) && !isSkillsHeadingLine(line));
  if (!carryover.length) return { educationLines: [] as string[], skillsLines };
  return {
    educationLines: carryover,
    skillsLines: [
      ...skillsLines.slice(0, heading + 1),
      ...skillsLines.slice(firstLanguage),
    ],
  };
}

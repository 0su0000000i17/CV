import {
  detailsHeadings,
  educationHeadings,
  experienceHeadings,
  skillsHeadings,
  sliceAfter,
  targetHeadings,
} from "./headings.js";

export function getSnapshotTargetDetails(lines: string[]) {
  return sliceAfter(lines, targetHeadings, experienceHeadings).slice(1);
}

export function getSnapshotEducationLines(lines: string[]) {
  return sliceAfter(lines, educationHeadings, [
    ...skillsHeadings,
    ...detailsHeadings,
  ]);
}

export function getSnapshotLanguageLines(lines: string[]) {
  const result: string[] = [];
  for (const line of sliceAfter(lines, skillsHeadings, detailsHeadings)) {
    if (line.startsWith("Навыки")) break;
    result.push(line.replace("Знание языков", "").trim());
  }
  return result.filter(Boolean);
}

export function getSnapshotDetailLines(lines: string[]) {
  return sliceAfter(lines, detailsHeadings, [])
    .map((line) => line.replace(/^Обо мне\s*/iu, "").trim())
    .filter((line) => Boolean(line) && !line.includes("Резюме обновлено"));
}

export function findSnapshotExperienceTitle(lines: string[]) {
  return lines.find((line) => line.startsWith("Опыт работы")) || "Опыт работы";
}

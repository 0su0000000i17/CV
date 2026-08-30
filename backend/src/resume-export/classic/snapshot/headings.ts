export const targetHeadings = ["Желаемая должность"];
export const experienceHeadings = ["Опыт работы"];
export const educationHeadings = ["Образование"];
export const skillsHeadings = ["Ключевые навыки", "Навыки"];
export const detailsHeadings = ["Дополнительная информация", "Обо мне"];
export const contentHeadings = [
  ...targetHeadings,
  ...experienceHeadings,
  ...educationHeadings,
  ...skillsHeadings,
  ...detailsHeadings,
];

function startsWithAny(line: string, headings: string[]) {
  return headings.some((heading) => line.startsWith(heading));
}

export function findHeadingIndex(lines: string[], headings: string[]) {
  return lines.findIndex((line) => startsWithAny(line, headings));
}

export function sliceAfter(lines: string[], startList: string[], endList: string[]) {
  const startIndex = findHeadingIndex(lines, startList);
  if (startIndex < 0) return [];
  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && startsWithAny(line, endList)
  );
  return lines.slice(startIndex + 1, endIndex > 0 ? endIndex : lines.length);
}

export type SectionKind =
  | "target" | "experience" | "education" | "skills" | "additional";

export const sectionMatchers: Record<SectionKind, (line: string) => boolean> = {
  target: (line) => line === "Желаемая должность и зарплата",
  experience: (line) => /^Опыт работы(?:\s+[—–-]\s+.+)?$/i.test(line),
  education: (line) => /^Образование(?:\s|$)/i.test(line),
  skills: (line) => /^(?:Навыки|Ключевые навыки|Знание языков)(?:\s|$)/i.test(line),
  additional: (line) => /^(?:Дополнительная информация|Обо мне)(?:\s|$)/i.test(line),
};

export function getInlineHeadingContent(line: string, kind: SectionKind) {
  const patterns: Record<SectionKind, RegExp> = {
    target: /^Желаемая должность и зарплата\s*/i,
    experience: /^Опыт работы(?:\s+[—–-]\s+.+)?\s*/i,
    education: /^Образование\s*/i,
    skills: /^(?:Навыки|Ключевые навыки|Знание языков)\s*/i,
    additional: /^(?:Дополнительная информация|Обо мне)\s*/i,
  };
  const content = line.replace(patterns[kind], "").trim();
  return content && content !== line ? content : "";
}

import type { SourceResumeDocument } from "../types.js";
import { cleanLayoutText, isServiceLine } from "./layout-utils.js";

export function cleanAdditionalInfo(additional: SourceResumeDocument["additional"]) {
  const emptyContactLabel = /^(?:Telegram|Телеграм|WhatsApp|E-mail|Email|Телефон):?$/iu;
  const cleanParagraph = (paragraph: string) => {
    const lines = paragraph.split("\n").map(cleanLayoutText).filter(Boolean);
    return lines.filter((line, index) => {
      if (!emptyContactLabel.test(line)) return true;
      const next = lines[index + 1];
      return Boolean(next && !emptyContactLabel.test(next) && !isServiceLine(next));
    }).join("\n");
  };
  return { ...additional, about: additional.about.map(cleanParagraph).filter(Boolean) };
}

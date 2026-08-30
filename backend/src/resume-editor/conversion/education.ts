import type { SourceResumeDocument } from "../../resume-document/types.js";
import { cleanList, text } from "./text.js";

export function educationToNotes(document: SourceResumeDocument) {
  const items = document.education.items.map((item) =>
    [item.year, item.level, item.institution, item.faculty, item.specialization, item.details]
      .map(text)
      .filter(Boolean)
      .join(" — "),
  );
  const courses = document.courses.items.map((item) =>
    [item.year, item.title, item.organization, item.description]
      .map(text)
      .filter(Boolean)
      .join(" — "),
  );
  return cleanList([
    document.education.level || "",
    ...items,
    ...(courses.length ? ["Повышение квалификации, курсы", ...courses] : []),
  ]);
}

import { createHhReadingOrder } from "../../resume-processing/pdf-layout/hh-reading-order.js";
import type { PdfLayoutDocument } from "../../resume-processing/pdf-layout/types.js";
import { parseSourceResumeDocument } from "../parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../types.js";
import { cleanAdditionalInfo } from "./additional-info.js";
import { getHeaderContacts } from "./contacts.js";
import { layoutExperience } from "./experience.js";
import { layoutSkillItems } from "./skills.js";
import { layoutSalary, layoutTargetTitle, layoutTargetValue } from "./target.js";

export type ParsedHhLayout = {
  document: SourceResumeDocument;
  text: string;
  experienceItems: number;
};

export function parseHhLayout(layout: PdfLayoutDocument): ParsedHhLayout {
  const readingOrder = createHhReadingOrder(layout);
  const parsed = parseSourceResumeDocument(readingOrder.text);
  const contacts = getHeaderContacts(layout, parsed);
  return {
    text: readingOrder.text,
    experienceItems: readingOrder.experienceItems,
    document: {
      ...parsed,
      source: "hh_pdf",
      personal: {
        ...parsed.personal,
        contactLines: contacts.contactLines.length
          ? contacts.contactLines : parsed.personal.contactLines,
        contactLineGaps: contacts.contactLineGaps.length
          ? contacts.contactLineGaps : parsed.personal.contactLineGaps,
      },
      target: {
        ...parsed.target,
        title: layoutTargetTitle(layout) || parsed.target.title,
        salary: layoutSalary(layout) || parsed.target.salary,
        employment: layoutTargetValue(layout, /^(?:Тип занятости|Занятость)[^:]*:/iu)
          || parsed.target.employment,
        schedule: layoutTargetValue(layout, /^График работы[^:]*:/iu) || parsed.target.schedule,
        workFormat: layoutTargetValue(layout, /^Формат работы[^:]*:/iu) || parsed.target.workFormat,
        commuteTime: layoutTargetValue(layout, /^Желательное время[^:]*:/iu)
          || parsed.target.commuteTime,
      },
      skills: { ...parsed.skills, items: layoutSkillItems(parsed) },
      experience: layoutExperience(layout, parsed.experience),
      additional: cleanAdditionalInfo(parsed.additional),
      meta: {
        ...parsed.meta,
        parser: "hh_layout_v1",
        layout: {
          template: "hh_standard",
          pages: layout.pages.length,
          lines: layout.pages.reduce((sum, page) => sum + page.lines.length, 0),
        },
      },
    },
  };
}

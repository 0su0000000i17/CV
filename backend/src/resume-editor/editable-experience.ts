import type { SourceResumeDocument } from "../resume-document/types.js";
import {
  descriptionToBlocks,
  editorNullable,
  editorStringList,
  editorText,
  isEditorRecord,
} from "./editable-value.js";

function parseEditorDates(
  value: unknown,
  fallback: SourceResumeDocument["experience"]["items"][number]["dates"]
) {
  const normalized = editorText(value);
  if (!normalized) return fallback;
  const parts = normalized.split(/\s+[—–]\s+/u).map(editorText).filter(Boolean);
  return { ...fallback, start: parts[0] || fallback.start, end: parts[1] || null,
    raw: [normalized] };
}

export function updateEditableExperience(
  document: SourceResumeDocument,
  value: unknown
) {
  if (!Array.isArray(value)) return document.experience;
  return {
    ...document.experience,
    items: document.experience.items.map((item, index) => {
      const matched = value.find((candidate) =>
        isEditorRecord(candidate) && candidate.sourceIndex === item.sourceIndex
      );
      const editorItem = matched || value[index];
      if (!isEditorRecord(editorItem)) return item;
      return {
        ...item,
        company: {
          ...item.company,
          name: editorNullable(editorItem.company),
          city: editorNullable(editorItem.companyCity),
          url: editorNullable(editorItem.companyUrl),
          industries: Array.isArray(editorItem.companyIndustries)
            ? editorStringList(editorItem.companyIndustries)
            : item.company.industries,
        },
        position: editorNullable(editorItem.position),
        dates: parseEditorDates(editorItem.dates, item.dates),
        blocks: descriptionToBlocks(editorItem.description, item.blocks),
      };
    }),
  };
}

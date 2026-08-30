import type { SourceResumeDocument } from "../resume-document/types.js";
import { updateEditableExperience } from "./editable-experience.js";
import {
  editorNullable,
  editorStringList,
  editorText,
  isEditorRecord,
} from "./editable-value.js";

export function applyEditableToSourceDocument(
  document: SourceResumeDocument,
  resumeJson: unknown
): SourceResumeDocument {
  if (!isEditorRecord(resumeJson)) return document;
  const target = isEditorRecord(resumeJson.target) ? resumeJson.target : null;
  const adapted = isEditorRecord(resumeJson.adaptedResume)
    ? resumeJson.adaptedResume
    : null;
  const skills = isEditorRecord(adapted?.skills) ? adapted.skills : null;

  return {
    ...document,
    target: target ? {
      ...document.target,
      title: editorNullable(target.title),
      salary: editorNullable(target.salary),
      specializations: Array.isArray(target.specializations)
        ? editorStringList(target.specializations)
        : document.target.specializations,
      employment: editorNullable(target.employment),
      schedule: editorNullable(target.schedule),
      workFormat: editorNullable(target.workFormat),
      commuteTime: editorNullable(target.commuteTime),
    } : document.target,
    experience: updateEditableExperience(document, adapted?.experience),
    skills: skills ? {
      ...document.skills,
      items: editorStringList([
        ...editorStringList(skills.primary),
        ...editorStringList(skills.secondary),
        ...editorStringList(skills.deprioritized),
      ]),
    } : document.skills,
    additional: adapted ? {
      ...document.additional,
      about: typeof adapted.summary === "string"
        ? adapted.summary.split(/\n\s*\n+/u).map(editorText).filter(Boolean)
        : document.additional.about,
      structuredItems: Array.isArray(adapted.additionalInfo)
        ? editorStringList(adapted.additionalInfo)
        : document.additional.structuredItems,
    } : document.additional,
  };
}

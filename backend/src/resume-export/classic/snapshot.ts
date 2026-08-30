import { getSnapshotCompanyMeta } from "./snapshot/company-meta.js";
import { getSnapshotContactLines, getSnapshotSourceName } from "./snapshot/profile.js";
import {
  findSnapshotExperienceTitle,
  getSnapshotDetailLines,
  getSnapshotEducationLines,
  getSnapshotLanguageLines,
  getSnapshotTargetDetails,
} from "./snapshot/sections.js";
import { toTextLines } from "./text.js";
import type {
  ClassicContacts,
  ClassicExperienceItem,
  SourceSnapshot,
} from "./types.js";

export function createSourceSnapshot(params: {
  sourceText: string;
  contacts: ClassicContacts;
  experience: ClassicExperienceItem[];
}): SourceSnapshot {
  const lines = toTextLines(params.sourceText);
  const sourceName = getSnapshotSourceName(lines);
  return {
    sourceName,
    contactLines: getSnapshotContactLines(lines, params.contacts, sourceName),
    targetDetails: getSnapshotTargetDetails(lines),
    experienceTitle: findSnapshotExperienceTitle(lines),
    companyMeta: getSnapshotCompanyMeta(lines, params.experience),
    educationLines: getSnapshotEducationLines(lines),
    languageLines: getSnapshotLanguageLines(lines),
    detailLines: getSnapshotDetailLines(lines),
    footer: lines.find((line) => line.includes("Резюме обновлено")) ?? null,
  };
}

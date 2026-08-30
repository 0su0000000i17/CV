import type { SourceResumeDocument } from "../../resume-document/types.js";
import type {
  ClassicDocument,
  ClassicExportPayload,
  SourceSnapshot,
} from "./types.js";
import { cleanText } from "./text.js";
import {
  resolveContactLineGaps,
  resolveContactLines,
} from "./document/contact-lines.js";
import { resolveEducationLines } from "./document/education-lines.js";
import { resolvePhotoSize, resolvePhotoUrl } from "./document/photo.js";
import { resolveSkills } from "./document/resolve-skills.js";
import { createSnapshot } from "./document/snapshot-builder.js";
import { applySourceStructure } from "./document/source-structure.js";
import { resolveTargetSalary } from "./document/target-salary.js";

function createBaseName(sourceTitle: string) {
  return cleanText(sourceTitle).replace(/\.[^.]+$/iu, "") || "resume";
}

export function getCompanyMeta(snapshot: SourceSnapshot, company: string | null) {
  const name = cleanText(company);
  return name ? snapshot.companyMeta.find((item) => item.company === name) ?? null : null;
}

export function buildClassicDocument(params: {
  sourceTitle: string;
  sourceText: string;
  sourceDocument?: SourceResumeDocument | null;
  payload: ClassicExportPayload;
}): ClassicDocument {
  const sourceDocument = params.sourceDocument || null;
  const structured = applySourceStructure(params.payload, sourceDocument);
  const snapshot = createSnapshot({
    sourceText: params.sourceText,
    payload: structured,
    sourceDocument,
  });
  const sourceTitle = createBaseName(params.sourceTitle || structured.sourceTitle);
  const targetTitle = cleanText(structured.adaptation.adaptedResume.headline) ||
    cleanText(structured.adaptation.target.title);
  const salary = resolveTargetSalary({
    payload: structured,
    sourceDocument,
    snapshot,
  });
  const payload: ClassicExportPayload = {
    ...structured,
    adaptation: {
      ...structured.adaptation,
      target: { ...structured.adaptation.target, salary },
    },
  };
  const contactLines = resolveContactLines({
    contacts: payload.contacts,
    snapshot,
    sourceDocument,
  });
  return {
    ...payload,
    photoUrl: resolvePhotoUrl(payload, sourceDocument),
    photoSize: resolvePhotoSize(payload, sourceDocument),
    sourceText: params.sourceText,
    sourceDocument,
    sourceTitle,
    snapshot,
    name: cleanText(payload.contacts.fullName) || snapshot.sourceName || sourceTitle,
    contactLines,
    contactLineGaps: resolveContactLineGaps({
      contactLines,
      contacts: payload.contacts,
      sourceDocument,
    }),
    targetTitle,
    skills: resolveSkills({ payload, sourceDocument, snapshot }),
    educationLines: resolveEducationLines({ payload, snapshot, sourceDocument }),
  };
}

import type { ClassicDocument } from "../types.js";
import { layout } from "./layout.js";
import { renderExperienceItem } from "./experience/render-item.js";
import type { PdfWriter } from "./writer.js";

export function renderExperience(writer: PdfWriter, doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;
  if (!items.length) return;
  writer.y += layout.experienceSectionTopGap;
  writer.sectionTitle(doc.snapshot.experienceTitle || "Опыт работы");
  items.forEach((item, index) => renderExperienceItem(writer, doc, item, index === 0));
}

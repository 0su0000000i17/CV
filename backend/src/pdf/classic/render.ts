import { PDFDocument } from "pdf-lib";

import { drawDetails } from "./details-section.js";
import { drawEducation } from "./education-section.js";
import { drawExperience } from "./experience-section.js";
import { loadClassicFonts } from "./fonts.js";
import { drawHeader } from "./header-section.js";
import { COLORS, FONT, PAGE } from "./metrics.js";
import { drawPhoto } from "./photo.js";
import { drawSkills } from "./skills-section.js";
import { createSourceSnapshot } from "./source-snapshot.js";
import { drawTarget } from "./target-section.js";
import type { ClassicExportDocument } from "./types.js";
import { ClassicWriter } from "./writer.js";

function drawFooter(writer: ClassicWriter, footer: string | null) {
  if (!footer) {
    return;
  }

  writer.text({
    text: footer,
    x: PAGE.left,
    y: 810,
    size: FONT.footer,
    color: COLORS.light,
  });
}

export async function renderClassicResumePdf(doc: ClassicExportDocument) {
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadClassicFonts(pdfDoc);
  const writer = new ClassicWriter(pdfDoc, fonts);

  const snapshot = createSourceSnapshot({
    sourceText: doc.sourceText,
    contacts: doc.contacts,
    experience: doc.adaptation.adaptedResume.experience,
  });

  const hasPhoto = await drawPhoto(writer, doc.photoUrl);

  drawHeader(writer, doc, snapshot, hasPhoto);
  drawTarget(writer, doc, snapshot);
  drawExperience(writer, doc, snapshot);
  drawEducation(writer, snapshot);
  drawSkills(writer, snapshot);
  drawDetails(writer, doc);
  drawFooter(writer, snapshot.footer);

  return pdfDoc.save({
    useObjectStreams: true,
  });
}
import type { ClassicDocument } from "../types.js";
import { renderHeader } from "./contacts.js";
import { renderEducation } from "./education-renderer.js";
import { renderExperience } from "./experience-renderer.js";
import { registerPdfFonts } from "./fonts.js";
import { makePdfBuffer } from "./make-buffer.js";
import { renderDetails } from "./sections/details.js";
import { renderFooter } from "./sections/footer.js";
import { renderSkills } from "./sections/skills.js";
import { renderTarget } from "./target.js";
import { PdfWriter } from "./writer.js";

export async function renderClassicResumePdfWithPdfKit(doc: ClassicDocument) {
  return makePdfBuffer((pdf) => {
    const writer = new PdfWriter(pdf, registerPdfFonts(pdf));
    renderHeader(writer, doc);
    renderTarget(writer, doc);
    renderExperience(writer, doc);
    renderEducation(writer, doc);
    renderSkills(writer, doc);
    renderDetails(writer, doc);
    renderFooter(writer, doc);
  });
}

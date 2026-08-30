import { renderClassicResumePdfWithPdfKit } from "./pdfkit/renderer.js";
import type { ClassicDocument } from "./types.js";

export async function renderClassicResumePdf(doc: ClassicDocument) {
  return renderClassicResumePdfWithPdfKit(doc);
}

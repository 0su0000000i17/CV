import PDFDocument from "pdfkit";

import { page } from "./layout.js";

export function makePdfBuffer(render: (doc: PDFDocument) => void) {
  return new Promise<Buffer>((resolve, reject) => {
    const pdf = new PDFDocument({
      size: [page.width, page.height],
      margin: 0,
      bufferPages: false,
      autoFirstPage: true,
      compress: true,
    });
    const chunks: Buffer[] = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);
    render(pdf);
    pdf.end();
  });
}

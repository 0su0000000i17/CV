import { PDFDocument, PDFPage, PDFFont, RGB } from "pdf-lib";

import type { ClassicFonts } from "./fonts.js";
import { COLORS, FONT, LINE, PAGE } from "./metrics.js";
import { cleanText, wrapText } from "./text.js";

export class ClassicWriter {
  page: PDFPage;
  y = PAGE.nameTop;

  constructor(
    readonly pdfDoc: PDFDocument,
    readonly fonts: ClassicFonts
  ) {
    this.page = this.pdfDoc.addPage([PAGE.width, PAGE.height]);
  }

  addPage() {
    this.page = this.pdfDoc.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.nameTop;
  }

  ensure(height: number) {
    if (this.y + height > PAGE.height - PAGE.bottom) {
      this.addPage();
    }
  }

  text(params: {
    text: string;
    x: number;
    y?: number;
    font?: PDFFont;
    size?: number;
    color?: RGB;
  }) {
    const size = params.size ?? FONT.body;
    const value = cleanText(params.text);

    if (!value) {
      return;
    }

    this.page.drawText(value, {
      x: params.x,
      y: PAGE.height - (params.y ?? this.y) - size,
      size,
      font: params.font ?? this.fonts.regular,
      color: params.color ?? COLORS.black,
    });
  }

  paragraph(params: {
    text: string;
    x: number;
    width: number;
    font?: PDFFont;
    size: number;
    lineHeight: number;
    color?: RGB;
  }) {
    const font = params.font ?? this.fonts.regular;
    const lines = wrapText({
      text: params.text,
      font,
      size: params.size,
      width: params.width,
    });

    for (const line of lines) {
      this.ensure(params.lineHeight);
      this.text({ ...params, text: line, font });
      this.y += params.lineHeight;
    }
  }

  section(title: string, topGap = 24) {
    this.ensure(34);
    this.y += topGap;

    this.text({
      text: title,
      x: PAGE.left,
      size: FONT.section,
      color: COLORS.light,
    });

    this.page.drawLine({
      start: { x: PAGE.left, y: PAGE.height - this.y - 12 },
      end: { x: PAGE.width - PAGE.right, y: PAGE.height - this.y - 12 },
      thickness: 0.55,
      color: COLORS.line,
    });

    this.y += 20;
  }

  tag(text: string, x: number, y: number) {
    const value = cleanText(text);
    const width = this.fonts.regular.widthOfTextAtSize(value, FONT.tag) + 8;

    this.page.drawRectangle({
      x,
      y: PAGE.height - y - 12,
      width,
      height: 12,
      color: COLORS.tagBg,
    });

    this.text({ text: value, x: x + 4, y: y + 1.5, size: FONT.tag });

    return width;
  }
}
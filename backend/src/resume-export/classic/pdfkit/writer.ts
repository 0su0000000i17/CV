import type { RegisteredPdfFonts } from "./fonts.js";
import { normalizePdfText } from "../text.js";
import { colors, layout, page, typography } from "./layout.js";
import type { PdfDoc, TextStyle } from "./writer-types.js";

export type { TextStyle } from "./writer-types.js";
export class PdfWriter {
  readonly doc: PdfDoc;
  readonly fonts: RegisteredPdfFonts;
  y = page.marginTop;

  constructor(doc: PdfDoc, fonts: RegisteredPdfFonts) {
    this.doc = doc;
    this.fonts = fonts;
  }
  get left() {
    return page.marginLeft;
  }
  get right() {
    return page.width - page.marginRight;
  }

  get bottom() {
    return page.height - page.marginBottom;
  }

  get contentWidth() {
    return layout.contentWidth;
  }

  setFont(style: TextStyle) {
    const fontName = style.font === "bold" ? this.fonts.bold : this.fonts.regular;
    this.doc.font(fontName).fontSize(style.size).fillColor(style.color || colors.text);
  }

  measure(text: string, width: number, style: TextStyle) {
    const value = normalizePdfText(text);
    this.setFont(style);
    return this.doc.heightOfString(value, {
      width,
      lineGap: style.lineGap ?? 0,
    });
  }

  ensureSpace(height: number) {
    if (this.y + height <= this.bottom) return;
    this.doc.addPage();
    this.y = page.marginTop;
  }

  textAt(text: string, x: number, y: number, width: number, style: TextStyle) {
    const value = normalizePdfText(text).trim();
    if (!value) return 0;

    this.setFont(style);
    const height = this.doc.heightOfString(value, {
      width,
      lineGap: style.lineGap ?? 0,
    });
    this.doc.text(value, x, y, {
      width,
      lineGap: style.lineGap ?? 0,
    });

    return height;
  }

  paragraph(text: string, width: number, style: TextStyle, gapAfter = 0) {
    const value = text.trim();
    if (!value) return 0;

    const height = this.measure(value, width, style);
    this.ensureSpace(height + gapAfter);
    const used = this.textAt(value, this.left, this.y, width, style);
    this.y += used + gapAfter;
    return used;
  }

  sectionTitle(title: string) {
    if (!title.trim()) return;

    this.ensureSpace(21);
    this.textAt(title, this.left, this.y, this.contentWidth, {
      font: "regular",
      size: typography.sectionTitle,
      color: colors.lightMuted,
    });
    this.y += 13;
    this.doc
      .strokeColor(colors.line)
      .lineWidth(1)
      .moveTo(this.left, this.y)
      .lineTo(this.right, this.y)
      .stroke();
    this.y += 8;
  }

  line(x1: number, y1: number, x2: number, y2: number, color = colors.line) {
    this.doc.strokeColor(color).lineWidth(1).moveTo(x1, y1).lineTo(x2, y2).stroke();
  }

  tag(text: string, x: number, y: number, maxWidth: number) {
    const value = normalizePdfText(text);
    this.setFont({ size: typography.skillTag, color: colors.text });
    const horizontalPadding = 6;
    const textWidth = Math.min(this.doc.widthOfString(value), maxWidth - horizontalPadding);
    const tagWidth = textWidth + horizontalPadding;
    const tagHeight = 14.25;

    this.doc.roundedRect(x, y, tagWidth, tagHeight, 0).fill(colors.tagBg);
    this.setFont({ size: typography.skillTag, color: colors.text });
    this.doc.text(value, x + 3, y + 2.05, { width: textWidth + 0.5, lineBreak: false });

    return { width: tagWidth, height: tagHeight };
  }

  image(src: Buffer, x: number, y: number, options: Record<string, unknown>) {
    this.doc.image(src, x, y, options);
  }
}

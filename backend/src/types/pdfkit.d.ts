declare module "pdfkit" {
  type PdfKitOptions = Record<string, unknown>;

  export default class PDFDocument {
    constructor(options?: PdfKitOptions);

    page: { width: number; height: number };
    x: number;
    y: number;

    on(event: "data", callback: (chunk: Buffer) => void): this;
    on(event: "end", callback: () => void): this;
    on(event: "error", callback: (error: Error) => void): this;

    end(): void;
    addPage(options?: PdfKitOptions): this;
    registerFont(name: string, src: string): this;
    font(name: string): this;
    fontSize(size: number): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    fill(color?: string): this;
    text(text: string, x?: number, y?: number, options?: Record<string, unknown>): this;
    image(src: Buffer | string, x?: number, y?: number, options?: Record<string, unknown>): this;
    widthOfString(text: string, options?: Record<string, unknown>): number;
    heightOfString(text: string, options?: Record<string, unknown>): number;
  }
}

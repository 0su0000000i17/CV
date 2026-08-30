export type PdfDoc = {
  page: { width: number; height: number };
  addPage: () => PdfDoc;
  font: (name: string) => PdfDoc;
  fontSize: (size: number) => PdfDoc;
  fillColor: (color: string) => PdfDoc;
  strokeColor: (color: string) => PdfDoc;
  lineWidth: (width: number) => PdfDoc;
  moveTo: (x: number, y: number) => PdfDoc;
  lineTo: (x: number, y: number) => PdfDoc;
  stroke: () => PdfDoc;
  roundedRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => PdfDoc;
  fill: (color?: string) => PdfDoc;
  text: (
    text: string,
    x?: number,
    y?: number,
    options?: Record<string, unknown>
  ) => PdfDoc;
  image: (
    src: Buffer | string,
    x?: number,
    y?: number,
    options?: Record<string, unknown>
  ) => PdfDoc;
  widthOfString: (text: string, options?: Record<string, unknown>) => number;
  heightOfString: (text: string, options?: Record<string, unknown>) => number;
};

export type TextStyle = {
  font?: "regular" | "bold";
  size: number;
  color?: string;
  lineGap?: number;
};

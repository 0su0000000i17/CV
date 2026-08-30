export const PDF_LAYOUT_DOCUMENT_VERSION = 1 as const;

type PdfLayoutWord = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string | null;
};

export type PdfLayoutLine = {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string | null;
  words: PdfLayoutWord[];
};

type PdfLayoutPage = {
  page: number;
  width: number;
  height: number;
  lines: PdfLayoutLine[];
};

export type PdfLayoutDocument = {
  version: typeof PDF_LAYOUT_DOCUMENT_VERSION;
  pages: PdfLayoutPage[];
};

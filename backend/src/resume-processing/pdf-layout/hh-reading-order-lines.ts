import type { PdfLayoutDocument, PdfLayoutLine } from "./types.js";

export function visualOrder(lines: PdfLayoutLine[]) {
  const result: PdfLayoutLine[] = [];
  const pages = new Map<number, PdfLayoutLine[]>();

  for (const line of lines) {
    const pageLines = pages.get(line.page) ?? [];
    pageLines.push(line);
    pages.set(line.page, pageLines);
  }

  for (const page of [...pages.keys()].sort((a, b) => a - b)) {
    const rows: Array<{ y: number; lines: PdfLayoutLine[] }> = [];
    const pageLines = [...(pages.get(page) ?? [])]
      .sort((a, b) => a.y - b.y || a.x - b.x);

    for (const line of pageLines) {
      const row = [...rows].reverse()
        .find((candidate) => Math.abs(candidate.y - line.y) <= 4);
      if (row) {
        row.lines.push(line);
        row.y = Math.min(row.y, line.y);
      } else {
        rows.push({ y: line.y, lines: [line] });
      }
    }

    rows.sort((a, b) => a.y - b.y).forEach((row) => {
      result.push(...row.lines.sort((a, b) => a.x - b.x));
    });
  }

  return result;
}

export function cleanLayoutText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

export function allLayoutLines(layout: PdfLayoutDocument) {
  return visualOrder(layout.pages.flatMap((page) => page.lines)).filter((line) => {
    const text = cleanLayoutText(line.text);
    return text && !/^(?:hh|hh\.ru|headhunter)$/iu.test(text);
  });
}

export function pageWidth(layout: PdfLayoutDocument, page: number) {
  return layout.pages.find((item) => item.page === page)?.width || 595;
}

export function positionKey(line: PdfLayoutLine) {
  return line.page * 10_000 + line.y;
}

export function lineTexts(lines: PdfLayoutLine[]) {
  return lines.map((line) => cleanLayoutText(line.text)).filter(Boolean);
}

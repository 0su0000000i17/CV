import type { PdfLayoutDocument, PdfLayoutLine } from "../../resume-processing/pdf-layout/types.js";

export function cleanLayoutText(value?: string | null) {
  return String(value || "").replace(/\s+/gu, " ").trim();
}

export function visualLines(layout: PdfLayoutDocument) {
  return layout.pages.flatMap((page) => page.lines)
    .sort((first, second) => first.page - second.page || first.y - second.y || first.x - second.x);
}

export function pageWidth(layout: PdfLayoutDocument, page: number) {
  return layout.pages.find((item) => item.page === page)?.width || 595;
}

export function layoutTextKey(value: string) {
  return cleanLayoutText(value).toLocaleLowerCase("ru-RU")
    .replace(/[^a-zа-яё0-9+#]+/giu, "");
}

export function verticalGap(previous: PdfLayoutLine | null, current: PdfLayoutLine) {
  if (!previous || previous.page !== current.page) return 0;
  return current.y - (previous.y + previous.height);
}

export function isServiceLine(value: string) {
  return /Резюме обновлено|предпочитаемый способ связи/iu.test(value);
}

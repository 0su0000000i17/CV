import { clean } from "../helpers.js";
import { colors, typography } from "../layout.js";
import type { PdfWriter, TextStyle } from "../writer.js";

const amountStyle: TextStyle = {
  font: "bold", size: typography.salaryAmount, color: colors.black, lineGap: 0,
};
const noteStyle: TextStyle = {
  size: typography.body, color: colors.black, lineGap: 0,
};

function splitSalary(value: string) {
  const salary = clean(value)
    .replace(/\s+/gu, " ")
    .replace(/\s+(?:₽|Р|руб\.?|RUB)(?=\s|$)/iu, " ₽")
    .replace(/\s+₽\s+/u, " ₽ ");
  const amountFirst = salary.match(/^(\d[\d\s.,]*)(?:\s+(.+?))?\s*₽$/u);
  if (amountFirst?.[1]) {
    const note = clean(amountFirst[2] || "");
    return { amount: clean(amountFirst[1]), note: note ? `₽ ${note}` : "₽" };
  }
  const currencyFirst = salary.match(/^(.+?)\s*₽(?:\s+(.+))?$/u);
  if (!currencyFirst?.[1]) return { amount: salary, note: "" };
  const note = clean(currencyFirst[2] || "");
  return { amount: clean(currencyFirst[1]), note: note ? `₽ ${note}` : "₽" };
}

type NoteRun = { text: string; symbol: boolean };

function splitNoteRuns(text: string): NoteRun[] {
  const index = text.indexOf("₽");
  if (index === -1) return text ? [{ text, symbol: false }] : [];
  const before = text.slice(0, index);
  const after = text.slice(index + 1);
  return [
    ...(before ? [{ text: before, symbol: false }] : []),
    { text: "₽", symbol: true },
    ...(after ? [{ text: after, symbol: false }] : []),
  ];
}

function setRunFont(writer: PdfWriter, symbol: boolean) {
  const font = symbol ? writer.fonts.symbolFallback : writer.fonts.regular;
  writer.doc.font(font).fontSize(noteStyle.size).fillColor(noteStyle.color || colors.black);
}

function measureRuns(writer: PdfWriter, runs: NoteRun[]) {
  return runs.reduce((width, run) => {
    setRunFont(writer, run.symbol);
    return width + writer.doc.widthOfString(run.text);
  }, 0);
}

function drawRuns(writer: PdfWriter, runs: NoteRun[], x: number, y: number) {
  let cursorX = x;
  for (const run of runs) {
    setRunFont(writer, run.symbol);
    const width = writer.doc.widthOfString(run.text);
    writer.doc.text(run.text, cursorX, y, { width: width + 1, lineBreak: false });
    cursorX += width;
  }
}

export function renderSalary(writer: PdfWriter, salary: string, y: number) {
  const { amount, note } = splitSalary(salary);
  if (!amount) return 0;
  writer.setFont(amountStyle);
  const amountWidth = writer.doc.widthOfString(amount);
  const amountHeight = writer.doc.heightOfString(amount, { width: amountWidth + 1, lineGap: 0 });
  const runs = note ? splitNoteRuns(` ${note}`) : [];
  const noteWidth = runs.length ? measureRuns(writer, runs) : 0;
  writer.setFont(noteStyle);
  const noteHeight = note ? writer.doc.heightOfString(note, { width: noteWidth + 1, lineGap: 0 }) : 0;
  const x = writer.right - amountWidth - noteWidth;
  writer.setFont(amountStyle);
  writer.doc.text(amount, x, y, { width: amountWidth + 1, lineBreak: false });
  const offset = Math.max(0, typography.salaryAmount - typography.body) * 0.72;
  if (runs.length) drawRuns(writer, runs, x + amountWidth, y + offset);
  return Math.max(amountHeight, noteHeight + offset);
}

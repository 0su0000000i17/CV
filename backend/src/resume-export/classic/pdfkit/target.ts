import type { ClassicDocument } from "../types.js";
import { clean } from "./helpers.js";
import { colors, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const salaryAmountStyle: TextStyle = { font: "bold", size: typography.salaryAmount, color: colors.black, lineGap: 0 };
const salaryNoteStyle: TextStyle = { size: typography.body, color: colors.black, lineGap: 0 };

function targetLines(doc: ClassicDocument) {
  const target = doc.adaptation.target;
  return [
    ...(target.specializations.length ? ["Специализации:", ...target.specializations.map((item) => `— ${clean(item)}`)] : []),
    clean(target.employment) ? `Тип занятости: ${clean(target.employment)}` : "",
    clean(target.schedule) ? `График: ${clean(target.schedule)}` : "",
    clean(target.workFormat) ? `Формат работы: ${clean(target.workFormat)}` : "",
    clean(target.commuteTime) ? `Желательное время в пути до работы: ${clean(target.commuteTime)}` : "",
  ].filter(Boolean);
}

function splitSalary(value: string) {
  const salary = clean(value)
    .replace(/\s+/gu, " ")
    .replace(/\s+[Р₽](?=\s|$)/u, " ₽")
    .replace(/\s+₽\s+/u, " ₽ ");

  const match = salary.match(/^(.+?)\s*[Р₽](?:\s+(.+))?$/u);
  if (!match?.[1]) return { amount: salary, note: "" };

  const note = clean(match[2] || "");
  return {
    amount: clean(match[1]),
    note: note ? `₽ ${note}` : "₽",
  };
}

function renderSalary(writer: PdfWriter, salary: string, y: number) {
  const { amount, note } = splitSalary(salary);
  if (!amount) return 0;

  writer.setFont(salaryAmountStyle);
  const amountWidth = writer.doc.widthOfString(amount);
  const amountHeight = writer.doc.heightOfString(amount, { width: amountWidth + 1, lineGap: 0 });

  writer.setFont(salaryNoteStyle);
  const noteWidth = note ? writer.doc.widthOfString(` ${note}`) : 0;
  const noteHeight = note ? writer.doc.heightOfString(note, { width: noteWidth + 1, lineGap: 0 }) : 0;

  const totalWidth = amountWidth + noteWidth;
  const x = writer.right - totalWidth;

  writer.setFont(salaryAmountStyle);
  writer.doc.text(amount, x, y, { width: amountWidth + 1, lineBreak: false });

  if (note) {
    writer.setFont(salaryNoteStyle);
    writer.doc.text(` ${note}`, x + amountWidth, y + Math.max(0, typography.salaryAmount - typography.body) * 0.72, {
      width: noteWidth + 1,
      lineBreak: false,
    });
  }

  return Math.max(amountHeight, noteHeight + Math.max(0, typography.salaryAmount - typography.body) * 0.72);
}

export function renderTarget(writer: PdfWriter, doc: ClassicDocument) {
  const target = doc.adaptation.target;
  const details = targetLines(doc);
  const salary = clean(target.salary);

  if (!doc.targetTitle && !salary && !details.length) return;

  writer.sectionTitle("Желаемая должность и зарплата");

  const titleWidth = salary ? writer.contentWidth - 156 : writer.contentWidth;
  const titleHeight = doc.targetTitle
    ? writer.textAt(doc.targetTitle, writer.left, writer.y, titleWidth, {
        font: "bold",
        size: typography.targetTitle,
        color: colors.black,
      })
    : 0;
  const salaryHeight = salary ? renderSalary(writer, salary, writer.y) : 0;

  writer.y += Math.max(titleHeight, salaryHeight) + 0.75;

  for (const line of details) {
    const indent = line.startsWith("—");
    const x = indent ? writer.left + 15 : writer.left;
    const width = indent ? writer.contentWidth - 15 : writer.contentWidth;
    writer.y += writer.textAt(line, x, writer.y, width, body) + 1.5;
  }
}

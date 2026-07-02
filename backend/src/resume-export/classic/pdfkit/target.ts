import type { ClassicDocument } from "../types.js";
import { clean } from "./helpers.js";
import { colors, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };

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
  const salary = clean(value).replace(/\s+/gu, " ");
  const match = salary.match(/^(.+?)\s*[₽Р](?:\s+(.+))?$/u);
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

  const width = 108;
  const x = writer.right - width;
  const amountHeight = writer.textAt(amount, x, y, width, {
    font: "bold",
    size: typography.salaryAmount,
    color: colors.black,
    lineGap: 0,
  });

  if (!note) return amountHeight;

  return amountHeight + writer.textAt(note, x, y + amountHeight + 1, width, {
    size: typography.salaryNote,
    color: colors.muted,
    lineGap: 0,
  }) + 1;
}

export function renderTarget(writer: PdfWriter, doc: ClassicDocument) {
  const target = doc.adaptation.target;
  const details = targetLines(doc);
  const salary = clean(target.salary);

  if (!doc.targetTitle && !salary && !details.length) return;

  writer.sectionTitle("Желаемая должность и зарплата");

  const titleWidth = salary ? writer.contentWidth - 112 : writer.contentWidth;
  const titleHeight = doc.targetTitle
    ? writer.textAt(doc.targetTitle, writer.left, writer.y, titleWidth, {
        font: "bold",
        size: typography.targetTitle,
        color: colors.black,
      })
    : 0;
  const salaryHeight = salary ? renderSalary(writer, salary, writer.y) : 0;

  writer.y += (titleHeight || salaryHeight) + 0.75;

  for (const line of details) {
    const indent = line.startsWith("—");
    const x = indent ? writer.left + 15 : writer.left;
    const width = indent ? writer.contentWidth - 15 : writer.contentWidth;
    writer.y += writer.textAt(line, x, writer.y, width, body) + 1.5;
  }
}

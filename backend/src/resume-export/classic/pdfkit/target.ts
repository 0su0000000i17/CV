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

function normalizeSalary(value: string) {
  return clean(value)
    .replace(/\s+/gu, " ")
    .replace(/\s+[Р₽](?=\s|$)/u, " ₽")
    .replace(/\s+₽\s+/u, " ₽ ");
}

function renderSalary(writer: PdfWriter, salary: string, y: number) {
  const text = normalizeSalary(salary);
  if (!text) return 0;

  const width = 128;
  const x = writer.right - width;
  return writer.textAt(text, x, y, width, {
    font: "bold",
    size: typography.salaryAmount,
    color: colors.black,
    lineGap: 0,
  });
}

export function renderTarget(writer: PdfWriter, doc: ClassicDocument) {
  const target = doc.adaptation.target;
  const details = targetLines(doc);
  const salary = clean(target.salary);

  if (!doc.targetTitle && !salary && !details.length) return;

  writer.sectionTitle("Желаемая должность и зарплата");

  const titleWidth = salary ? writer.contentWidth - 132 : writer.contentWidth;
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

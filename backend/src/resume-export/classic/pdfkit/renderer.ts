import PDFDocument from "pdfkit";

import { toTextLines, uniqueStrings } from "../text.js";
import type { ClassicDocument } from "../types.js";
import { renderHeader } from "./contacts.js";
import { renderEducation } from "./education-renderer.js";
import { renderExperience } from "./experience-renderer.js";
import { registerPdfFonts } from "./fonts.js";
import { clean, textKey } from "./helpers.js";
import { colors, layout, page, typography } from "./layout.js";
import { renderTarget } from "./target.js";
import { PdfWriter, type TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const muted: TextStyle = { size: typography.body, color: colors.muted, lineGap: 0.2 };

function renderLabeledLines(writer: PdfWriter, label: string, lines: string[], gap = 7.5) {
  if (!lines.length) return;

  const x = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x;
  const start = writer.y;

  writer.textAt(label, writer.left, start, layout.skillLabelWidth, muted);

  let y = start;
  for (const line of lines) {
    y += writer.textAt(line, x, y, width, body) + 1.5;
  }

  writer.y = Math.max(start + 13.5, y) + gap;
}

function renderLanguageValue(writer: PdfWriter, line: string, x: number, y: number, width: number) {
  const marker = " — ";
  const index = line.indexOf(marker);
  if (index < 0) return writer.textAt(line, x, y, width, body);

  const name = line.slice(0, index);
  const level = line.slice(index);
  const height = writer.measure(line, width, body);

  writer.setFont(body);
  writer.doc.text(name, x, y, { width, lineBreak: false });
  const nameWidth = writer.doc.widthOfString(name);

  writer.setFont(muted);
  writer.doc.text(level, x + nameWidth, y, { width: Math.max(0, width - nameWidth), lineBreak: false });

  return height;
}

function renderLanguages(writer: PdfWriter, lines: string[], gap = 7.5) {
  if (!lines.length) return;

  const x = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x;
  const start = writer.y;

  writer.textAt("Знание языков", writer.left, start, layout.skillLabelWidth, muted);

  let y = start;
  for (const line of lines) {
    y += renderLanguageValue(writer, line, x, y, width) + 1.5;
  }

  writer.y = Math.max(start + 13.5, y) + gap;
}

function asciiToken(value: string) {
  return value.split("").every((char) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+#./()-".includes(char));
}

function splitSkill(value: string) {
  const parts = clean(value).split(/[\n,;|•]+/u).map(clean).filter(Boolean);

  return parts.flatMap((part) => {
    const words = part.split(" ").filter(Boolean);
    if (words.length < 3 || !words.every(asciiToken)) return [part];

    const result: string[] = [];
    for (let index = 0; index < words.length; index += 1) {
      const pair = [words[index], words[index + 1]].filter(Boolean).join(" ");
      const triple = [words[index], words[index + 1], words[index + 2]].filter(Boolean).join(" ");

      if (triple === "React Hook Form") {
        result.push(triple);
        index += 2;
      } else if (["REST API", "RTK Query", "Redux Thunk", "React hooks"].includes(pair)) {
        result.push(pair);
        index += 1;
      } else {
        result.push(words[index]);
      }
    }

    return result;
  });
}

function removeRedundantSkillTags(values: string[]) {
  const keys = new Set(values.map((value) => textKey(value)));
  return values.filter((value) => {
    const words = clean(value).split(" ").filter(Boolean);
    return !(words.length > 1 && words.every((word) => keys.has(textKey(word))));
  });
}

function drawSkillsLabel(writer: PdfWriter, y: number) {
  writer.textAt("Навыки", writer.left, y, layout.skillLabelWidth, muted);
}

function renderSkills(writer: PdfWriter, doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return;

  writer.sectionTitle("Навыки");
  renderLanguages(writer, doc.snapshot.languageLines, layout.languageToSkillsGap);

  const x0 = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x0;
  let x = x0;
  let y = writer.y;

  drawSkillsLabel(writer, y);

  const skills = removeRedundantSkillTags(uniqueStrings(doc.skills.flatMap(splitSkill)));
  for (const skill of skills) {
    writer.setFont({ size: typography.skillTag });
    const tagWidth = Math.min(writer.doc.widthOfString(skill) + 6, width);

    if (x + tagWidth > x0 + width) {
      x = x0;
      y += 18;
    }

    if (y + 18 > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      x = x0;
      y = writer.y;
      drawSkillsLabel(writer, y);
    }

    const tag = writer.tag(skill, x, y, width);
    x += tag.width + 6.75;
  }

  writer.y = y + 18 + layout.skillsBottomGap;
}

function renderDetails(writer: PdfWriter, doc: ClassicDocument) {
  const lines = uniqueStrings([
    clean(doc.adaptation.adaptedResume.summary),
    ...doc.adaptation.adaptedResume.additionalInfo.flatMap(toTextLines),
    ...doc.snapshot.detailLines,
  ].map(clean).filter(Boolean));

  if (!lines.length) return;

  writer.y += layout.sectionBlockTopGap;
  writer.sectionTitle("Дополнительная информация");
  renderLabeledLines(writer, "Обо мне", [lines.join("\n")], 0);
}

function renderFooter(writer: PdfWriter, doc: ClassicDocument) {
  const footer = clean(doc.snapshot.footer || "").replace(/^(Резюме\s+обновлено\s*)+/iu, "Резюме обновлено ");
  if (!footer) return;

  writer.y += 21;
  writer.paragraph(clean(footer), writer.contentWidth, { size: typography.footer, color: colors.muted, lineGap: 0 });
}

function makeBuffer(render: (doc: PDFDocument) => void) {
  return new Promise<Buffer>((resolve, reject) => {
    const pdf = new PDFDocument({ size: [page.width, page.height], margin: 0, bufferPages: false, autoFirstPage: true, compress: true });
    const chunks: Buffer[] = [];

    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    render(pdf);
    pdf.end();
  });
}

export async function renderClassicResumePdfWithPdfKit(doc: ClassicDocument) {
  return makeBuffer((pdf) => {
    const writer = new PdfWriter(pdf, registerPdfFonts(pdf));

    renderHeader(writer, doc);
    renderTarget(writer, doc);
    renderExperience(writer, doc);
    renderEducation(writer, doc);
    renderSkills(writer, doc);
    renderDetails(writer, doc);
    renderFooter(writer, doc);
  });
}

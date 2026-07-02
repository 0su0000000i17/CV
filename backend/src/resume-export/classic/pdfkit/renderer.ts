import PDFDocument from "pdfkit";

import { getCompanyMeta } from "../document.js";
import { calculateExperienceDuration, splitDateLines, stripBullet, toTextLines, uniqueStrings } from "../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../types.js";
import { renderHeader } from "./contacts.js";
import { registerPdfFonts } from "./fonts.js";
import { clean, looksLikeUrl, textKey, uniqueLines } from "./helpers.js";
import { colors, layout, page, typography } from "./layout.js";
import { PdfWriter, type TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const muted: TextStyle = { size: typography.body, color: colors.muted, lineGap: 0.2 };

function lower(value: string) { return clean(value).toLowerCase(); }
function salary(d: ClassicDocument) { return lower(d.adaptation.target.salary); }
function hasSalary(d: ClassicDocument, line: string) { const s = salary(d); const t = lower(line); return Boolean(s && t.includes(s)); }
function city(value: string) { const t = clean(value); return t.length > 2 && t.length < 36 && !t.includes(".") && !t.includes("/") && t[0] === t[0].toUpperCase(); }
function prefix(text: string, p: string) { const a = clean(text); const b = clean(p); return b && lower(a).startsWith(`${lower(b)} `) ? clean(a.slice(b.length)) : a; }
function metaKey(value: string) { return textKey(clean(value).replace(/^[-•]\s*/u, "")); }
function bareMeta(value: string) { return clean(value).replace(/^[-•]\s*/u, ""); }

function renderTarget(w: PdfWriter, d: ClassicDocument) {
  const t = d.adaptation.target;
  const lines = [
    ...(t.specializations.length ? ["Специализации:", ...t.specializations.map((x) => `— ${clean(x)}`)] : []),
    clean(t.employment) ? `Тип занятости: ${clean(t.employment)}` : "",
    clean(t.schedule) ? `График: ${clean(t.schedule)}` : "",
    clean(t.workFormat) ? `Формат работы: ${clean(t.workFormat)}` : "",
    clean(t.commuteTime) ? `Желательное время в пути до работы: ${clean(t.commuteTime)}` : "",
  ].filter(Boolean);
  if (!d.targetTitle && !t.salary && !lines.length) return;
  w.sectionTitle("Желаемая должность и зарплата");
  const salaryText = clean(t.salary);
  const titleWidth = salaryText ? w.contentWidth - 112 : w.contentWidth;
  const a = d.targetTitle ? w.textAt(d.targetTitle, w.left, w.y, titleWidth, { font: "bold", size: typography.targetTitle, color: colors.black }) : 0;
  const b = salaryText ? w.textAt(salaryText, w.right - 108, w.y, 108, { font: "bold", size: typography.salaryAmount, color: colors.black }) : 0;
  w.y += Math.max(a, b) + 4.5;
  for (const line of lines) { const indent = line.startsWith("—"); w.y += w.textAt(line, indent ? w.left + 15 : w.left, w.y, indent ? w.contentWidth - 15 : w.contentWidth, body) + 1.5; }
}

function sourceMetaLines(d: ClassicDocument, it: ClassicExperienceItem) {
  const company = clean(it.company);
  if (!company) return [];
  const lines = toTextLines(d.sourceText).map(clean).filter(Boolean);
  const index = lines.findIndex((line) => line === company);
  if (index < 0) return [];
  const result: string[] = [];
  for (let offset = index + 1; offset < Math.min(lines.length, index + 10); offset += 1) {
    const line = lines[offset];
    if (!line || line === company || hasSalary(d, line)) continue;
    if (line.startsWith("Проект:") || line.startsWith("Стек:") || line.startsWith("Достижения:")) break;
    if (/(^|\s)(разработчик|developer|engineer|программист|аналитик|дизайнер|менеджер)(\s|$)/iu.test(line)) break;
    if (/^(Образование|Навыки|Дополнительная информация|Резюме обновлено)/iu.test(line)) break;
    result.push(line);
  }
  return result;
}

function metaLines(d: ClassicDocument, it: ClassicExperienceItem) {
  const snap = getCompanyMeta(d.snapshot, it.company)?.lines ?? [];
  const direct = toTextLines(it.companyUrl).filter(Boolean);
  const source = sourceMetaLines(d, it);
  const raw = [...(direct.length ? direct : []), ...snap, ...source].filter((x) => !hasSalary(d, x));
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const item of raw.map(clean).filter(Boolean)) {
    const key = metaKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  const out: string[] = [];
  for (let i = 0; i < deduped.length; i += 1) {
    if (deduped[i + 1] && city(deduped[i]) && looksLikeUrl(deduped[i + 1])) { out.push(`${deduped[i]}, ${deduped[i + 1]}`); i += 1; }
    else out.push(deduped[i]);
  }
  return out;
}

function roleFromLine(line: string) {
  const text = clean(stripBullet(line));
  const positions = [text.indexOf("Проект:"), text.indexOf("Стек:")].filter((x) => x > 0);
  const boundary = positions.length ? Math.min(...positions) : -1;
  if (boundary < 1) return "";
  const before = clean(text.slice(0, boundary));
  return /(^|\s)(разработчик|developer|engineer|программист|аналитик|дизайнер|менеджер)(\s|$)/iu.test(before) ? before : "";
}

function position(d: ClassicDocument, it: ClassicExperienceItem) {
  const direct = clean(it.position);
  if (direct) return direct;
  const inferred = [it.focus || "", ...it.adaptedBullets].map(roleFromLine).find(Boolean);
  if (inferred) return inferred;
  const target = clean(d.targetTitle).replace(/\s*\([^)]*\)\s*$/u, "");
  return roleFromLine(`${target} Проект:`) || target;
}

function cleanWork(line: string, pos: string, metas: string[]) {
  let t = clean(stripBullet(line));
  const pfx = uniqueLines(metas.map(bareMeta).filter((m) => !looksLikeUrl(m) && !m.includes(",")));
  for (const p of pfx.sort((a, b) => b.length - a.length)) {
    t = prefix(t, `${p} ${pos}`);
    const noMeta = prefix(t, p);
    if (noMeta.startsWith("Проект:") || noMeta.startsWith("Стек:") || roleFromLine(noMeta)) t = noMeta;
  }
  const noPos = prefix(t, pos);
  if (noPos.startsWith("Проект:") || noPos.startsWith("Стек:")) t = noPos;
  return clean(t);
}

function drawFlow(w: PdfWriter, text: string, x: number, y: number, width: number, gap: number) {
  let next = y; let broke = false; const h = w.measure(text, width, body);
  if (next + h > w.bottom) { w.doc.addPage(); w.y = page.marginTop; next = w.y; broke = true; }
  next += w.textAt(text, x, next, width, body) + gap;
  return { next, broke };
}

function renderExperienceItem(w: PdfWriter, d: ClassicDocument, it: ClassicExperienceItem, first: boolean) {
  const metas = metaLines(d, it); const pos = position(d, it); const x = w.left + layout.leftColumnWidth + layout.columnGap; const width = w.right - x;
  if (!first) w.y += layout.experienceGap; w.ensureSpace(42);
  const start = w.y; let broke = false; let y = start;
  const duration = calculateExperienceDuration(it.dates); const dates = [...splitDateLines(it.dates), duration].filter(Boolean).join("\n");
  const dh = dates ? w.textAt(dates, w.left, start, layout.leftColumnWidth, { size: typography.date, color: colors.muted, lineGap: 0.2 }) : 0;
  if (it.company) y += w.textAt(it.company, x, y, width, { font: "bold", size: typography.company, color: colors.black }) + 1.5;
  for (const m of metas) y += w.textAt(m.startsWith("•") ? m : bareMeta(m), x, y, width, { size: typography.meta, color: looksLikeUrl(m) || m.includes(",") ? colors.lightMuted : colors.text, lineGap: 0 }) + 0.75;
  if (pos) y += 7.5 + w.textAt(pos, x, y + 7.5, width, { size: typography.position, color: colors.text, lineGap: 0 }) + 5.25;
  const lines = [it.focus || "", ...it.adaptedBullets].map((v) => cleanWork(v, pos, metas)).filter((v) => v && !hasSalary(d, v));
  const projects = lines.filter((v) => v.startsWith("Проект:"));
  const stacks = lines.filter((v) => v.startsWith("Стек:"));
  const plain = lines.filter((v) => v.startsWith("Достижения:") && !projects.includes(v) && !stacks.includes(v));
  const bullets = lines.filter((v) => !projects.includes(v) && !stacks.includes(v) && !plain.includes(v));
  for (const v of [...projects, ...stacks, ...plain]) { const r = drawFlow(w, v, x, y, width, 4.5); y = r.next; broke ||= r.broke; }
  if (bullets.length && !plain.length) { const r = drawFlow(w, "Достижения:", x, y, width, 3.75); y = r.next; broke ||= r.broke; }
  for (const v of bullets) { const r = drawFlow(w, `- ${v}`, x, y, width, 3.75); y = r.next; broke ||= r.broke; }
  w.y = broke ? y : Math.max(start + dh, y);
}

function renderExperience(w: PdfWriter, d: ClassicDocument) {
  if (!d.adaptation.adaptedResume.experience.length) return;
  w.sectionTitle(d.snapshot.experienceTitle || "Опыт работы");
  d.adaptation.adaptedResume.experience.forEach((it, i) => renderExperienceItem(w, d, it, i === 0));
}

function sourceEducation(d: ClassicDocument) {
  const lines = toTextLines(d.sourceText); const idx = lines.findIndex((l) => lower(l).includes("университет") || lower(l).includes("институт"));
  if (idx < 0) return [];
  const before = lines.slice(Math.max(0, idx - 8), idx).map(clean); const year = [...before].reverse().find((l) => l.length === 4 && Number.isFinite(Number(l))) || "";
  const level = [...before].reverse().find((l) => l.startsWith("Высшее") || l.startsWith("Среднее")) || "Высшее";
  return uniqueLines([level, year ? `${year} ${clean(lines[idx])}` : clean(lines[idx])]);
}

function renderEducation(w: PdfWriter, d: ClassicDocument) {
  const lines = sourceEducation(d).length ? sourceEducation(d) : d.educationLines; if (!lines.length) return;
  w.sectionTitle("Образование"); const [level, ...rest] = lines; if (level) w.paragraph(level, w.contentWidth, body, 6);
  for (const row of rest) { const parts = clean(row).split(" "); const year = parts[0]; const text = parts.slice(1).join(" "); if (year.length === 4 && text) { const y = w.y; const a = w.textAt(year, w.left, y + 2, layout.leftColumnWidth, { size: typography.date, color: colors.muted }); const b = w.textAt(text, w.left + layout.leftColumnWidth + layout.columnGap, y, w.contentWidth - layout.leftColumnWidth - layout.columnGap, { font: "bold", size: typography.position, color: colors.text, lineGap: 0.4 }); w.y += Math.max(a, b) + 4; } else w.paragraph(row, w.contentWidth, { size: typography.position, color: colors.text, lineGap: 0.4 }, 3); }
}

function labeled(w: PdfWriter, label: string, lines: string[], gap = 7.5) { if (!lines.length) return; const x = w.left + layout.skillLabelWidth + layout.skillGap; const width = w.right - x; const start = w.y; w.textAt(label, w.left, start, layout.skillLabelWidth, muted); let y = start; for (const l of lines) y += w.textAt(l, x, y, width, body) + 1.5; w.y = Math.max(start + 13.5, y) + gap; }

function asciiToken(s: string) { return s.split("").every((ch) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+#./()-".includes(ch)); }
function packedSkill(part: string) { const words = clean(part).split(" ").filter(Boolean); return words.length >= 3 && words.every(asciiToken); }
function splitPacked(words: string[]) { const out: string[] = []; for (let i = 0; i < words.length; i += 1) { const pair = [words[i], words[i + 1]].filter(Boolean).join(" "); const triple = [words[i], words[i + 1], words[i + 2]].filter(Boolean).join(" "); if (triple === "React Hook Form") { out.push(triple); i += 2; } else if (["REST API", "RTK Query", "Redux Thunk", "React hooks"].includes(pair)) { out.push(pair); i += 1; } else out.push(words[i]); } return out; }
function skillParts(value: string) { const parts = clean(value).split(/[\n,;|•]+/u).map(clean).filter(Boolean); return parts.flatMap((part) => packedSkill(part) ? splitPacked(part.split(" ").filter(Boolean)) : [part]); }
function removeRedundantSkillTags(values: string[]) { const keys = new Set(values.map((v) => textKey(v))); return values.filter((v) => { const words = clean(v).split(" ").filter(Boolean); return !(words.length > 1 && words.every((word) => keys.has(textKey(word)))); }); }
function renderSkills(w: PdfWriter, d: ClassicDocument) { if (!d.snapshot.languageLines.length && !d.skills.length) return; w.sectionTitle("Навыки"); labeled(w, "Знание языков", d.snapshot.languageLines, 7.5); const x0 = w.left + layout.skillLabelWidth + layout.skillGap; const width = w.right - x0; let x = x0; let y = w.y; w.textAt("Навыки", w.left, y, layout.skillLabelWidth, muted); for (const s of removeRedundantSkillTags(uniqueStrings(d.skills.flatMap(skillParts)))) { w.setFont({ size: typography.skillTag }); const tw = Math.min(w.doc.widthOfString(s) + 6, width); if (x + tw > x0 + width) { x = x0; y += 18; } const tag = w.tag(s, x, y, width); x += tag.width + 6.75; } w.y = y + 18; }
function renderDetails(w: PdfWriter, d: ClassicDocument) { const lines = uniqueStrings([clean(d.adaptation.adaptedResume.summary), ...d.adaptation.adaptedResume.additionalInfo.flatMap(toTextLines), ...d.snapshot.detailLines].map(clean).filter(Boolean)); if (!lines.length) return; w.sectionTitle("Дополнительная информация"); labeled(w, "Обо мне", [lines.join("\n")], 0); }
function renderFooter(w: PdfWriter, d: ClassicDocument) { const footer = clean(d.snapshot.footer || "").replace(/^(Резюме\s+обновлено\s*)+/iu, "Резюме обновлено "); if (!footer) return; w.y += 21; w.paragraph(clean(footer), w.contentWidth, { size: typography.footer, color: colors.muted, lineGap: 0 }); }

function makeBuffer(render: (doc: PDFDocument) => void) { return new Promise<Buffer>((resolve, reject) => { const pdf = new PDFDocument({ size: [page.width, page.height], margin: 0, bufferPages: false, autoFirstPage: true, compress: true }); const chunks: Buffer[] = []; pdf.on("data", (chunk) => chunks.push(chunk)); pdf.on("end", () => resolve(Buffer.concat(chunks))); pdf.on("error", reject); render(pdf); pdf.end(); }); }

export async function renderClassicResumePdfWithPdfKit(d: ClassicDocument) { return makeBuffer((pdf) => { const w = new PdfWriter(pdf, registerPdfFonts(pdf)); renderHeader(w, d); renderTarget(w, d); renderExperience(w, d); renderEducation(w, d); renderSkills(w, d); renderDetails(w, d); renderFooter(w, d); }); }

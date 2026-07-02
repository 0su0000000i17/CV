import { getCompanyMeta } from "../document.js";
import { calculateExperienceDuration, splitDateLines, stripBullet, toTextLines } from "../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../types.js";
import { clean, looksLikeUrl, textKey, uniqueLines } from "./helpers.js";
import { colors, layout, page, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const months = "январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь";

function lower(value: string) { return clean(value).toLowerCase(); }
function key(value: string) { return textKey(clean(value).replace(/^[-•]\s*/u, "")); }
function hasSalary(doc: ClassicDocument, value: string) { const s = lower(doc.adaptation.target.salary); return Boolean(s && lower(value).includes(s)); }
function isRole(value: string) { const text = clean(value); return Boolean(text && !text.includes(":") && /(?:^|[\s\-‑–—\/])(разработчик|developer|engineer|программист|аналитик|дизайнер|менеджер|специалист|редактор)(?:\s|$)/iu.test(text)); }
function isStop(value: string) { const text = clean(value); return new RegExp(`^(?:${months})\\s+\\d{4}`, "iu").test(text) || /^(Образование|Навыки|Дополнительная информация|Резюме обновлено)(\s|$)/iu.test(text); }
function isCity(value: string) { const text = clean(value); return text.length > 2 && text.length < 36 && !text.includes(".") && !text.includes("/") && text[0] === text[0].toUpperCase(); }
function same(a: string, b: string) { const aKey = key(a); return Boolean(aKey && aKey === key(b)); }
function bare(value: string) { return clean(value).replace(/^[-•]\s*/u, ""); }
function metaMuted(value: string) { return looksLikeUrl(value); }
function lines(doc: ClassicDocument) { return toTextLines(doc.sourceText).map(clean).filter(Boolean); }
function companyAt(doc: ClassicDocument, item: ClassicExperienceItem) { const company = clean(item.company); return company ? lines(doc).findIndex((line) => line === company) : -1; }

function dedupe(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map(clean).filter(Boolean)) {
    if (isRole(value)) continue;
    const valueKey = key(value);
    if (!valueKey || seen.has(valueKey)) continue;
    seen.add(valueKey);
    result.push(value);
  }
  return result;
}

function sourceMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const source = lines(doc);
  const index = companyAt(doc, item);
  if (index < 0) return [];
  const result: string[] = [];
  for (let i = index + 1; i < Math.min(source.length, index + 14); i += 1) {
    const line = source[i];
    if (!line || hasSalary(doc, line)) continue;
    if (isStop(line) || line.startsWith("Проект:") || line.startsWith("Стек:") || line.startsWith("Достижения:") || isRole(line)) break;
    result.push(line);
  }
  return result;
}

function meta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const snapshot = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const direct = toTextLines(item.companyUrl).filter(Boolean);
  const raw = dedupe([...(direct.length ? direct : []), ...snapshot, ...sourceMeta(doc, item)].filter((line) => !hasSalary(doc, line)));
  const result: string[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i + 1] && isCity(raw[i]) && looksLikeUrl(raw[i + 1])) { result.push(`${raw[i]}, ${raw[i + 1]}`); i += 1; }
    else result.push(raw[i]);
  }
  return dedupe(result);
}

function sourcePosition(doc: ClassicDocument, item: ClassicExperienceItem) {
  const source = lines(doc);
  const index = companyAt(doc, item);
  if (index < 0) return "";
  for (let i = index + 1; i < Math.min(source.length, index + 16); i += 1) {
    const line = clean(stripBullet(source[i] || ""));
    if (!line || hasSalary(doc, line)) continue;
    if (isStop(line) || line.startsWith("Проект:") || line.startsWith("Стек:") || line.startsWith("Достижения:")) break;
    if (isRole(line)) return line;
  }
  return "";
}

function roleBeforeMarker(value: string) {
  const text = clean(stripBullet(value));
  const indexes = [text.indexOf("Проект:"), text.indexOf("Стек:")].filter((index) => index > 0);
  if (!indexes.length) return "";
  const before = clean(text.slice(0, Math.min(...indexes)));
  return isRole(before) ? before : "";
}

function position(doc: ClassicDocument, item: ClassicExperienceItem) {
  return sourcePosition(doc, item) ||
    (isRole(item.position || "") ? clean(item.position) : "") ||
    [item.focus || "", ...item.adaptedBullets].map(roleBeforeMarker).find(Boolean) ||
    (isRole(doc.targetTitle) ? clean(doc.targetTitle).replace(/\s*\([^)]*\)\s*$/u, "") : clean(item.position));
}

function removePrefix(value: string, prefix: string) {
  const text = clean(value);
  const preparedPrefix = lower(prefix);
  return preparedPrefix && lower(text).startsWith(`${preparedPrefix} `) ? clean(text.slice(clean(prefix).length)) : text;
}

function cleanContent(value: string, pos: string, metas: string[]) {
  let text = clean(stripBullet(value));
  for (const item of uniqueLines(metas.map(bare).filter((line) => !looksLikeUrl(line) && !line.includes(","))).sort((a, b) => b.length - a.length)) {
    if (pos) text = removePrefix(text, `${item} ${pos}`);
    const withoutMeta = removePrefix(text, item);
    if (withoutMeta.startsWith("Проект:") || withoutMeta.startsWith("Стек:") || roleBeforeMarker(withoutMeta)) text = withoutMeta;
  }
  if (pos) {
    const withoutPosition = removePrefix(text, pos);
    if (withoutPosition.startsWith("Проект:") || withoutPosition.startsWith("Стек:")) text = withoutPosition;
  }
  const indexes = [text.indexOf("Проект:"), text.indexOf("Стек:")].filter((index) => index > 0);
  if (indexes.length) {
    const index = Math.min(...indexes);
    const before = clean(text.slice(0, index));
    if (isRole(before) || (pos && same(before, pos))) text = clean(text.slice(index));
  }
  return text;
}

function skipContent(doc: ClassicDocument, value: string, pos: string, metas: string[]) {
  if (!value || hasSalary(doc, value)) return true;
  if (same(value, pos) || same(value, doc.targetTitle)) return true;
  if (metas.some((item) => same(value, item))) return true;
  return isRole(value);
}

function draw(writer: PdfWriter, text: string, x: number, y: number, width: number) {
  const structured = text.startsWith("Проект:") || text.startsWith("Стек:") || text.startsWith("Достижения:");
  const rendered = structured ? text : `- ${text}`;
  const gap = structured ? 4.5 : 3.75;
  let next = y;
  let broke = false;
  const height = writer.measure(rendered, width, body);
  if (next + height > writer.bottom) { writer.doc.addPage(); writer.y = page.marginTop; next = writer.y; broke = true; }
  next += writer.textAt(rendered, x, next, width, body) + gap;
  return { next, broke };
}

function renderItem(writer: PdfWriter, doc: ClassicDocument, item: ClassicExperienceItem, first: boolean) {
  const metas = meta(doc, item);
  const pos = position(doc, item);
  const x = writer.left + layout.leftColumnWidth + layout.columnGap;
  const width = writer.right - x;
  if (!first) writer.y += layout.experienceGap;
  writer.ensureSpace(42);
  const start = writer.y;
  let y = start;
  let broke = false;
  const dateText = [...splitDateLines(item.dates), calculateExperienceDuration(item.dates)].filter(Boolean).join("\n");
  const dateHeight = dateText ? writer.textAt(dateText, writer.left, start, layout.leftColumnWidth, { size: typography.date, color: colors.muted, lineGap: 0.2 }) : 0;
  if (item.company) y += writer.textAt(item.company, x, y, width, { font: "bold", size: typography.company, color: colors.black }) + 1.5;
  for (const itemMeta of metas) y += writer.textAt(bare(itemMeta), x, y, width, { size: typography.meta, color: metaMuted(itemMeta) ? colors.lightMuted : colors.text, lineGap: 0 }) + 0.75;
  if (pos) y += 7.5 + writer.textAt(pos, x, y + 7.5, width, { size: typography.position, color: colors.text, lineGap: 0 }) + 5.25;
  const content = [item.focus || "", ...item.adaptedBullets].flatMap(toTextLines).map((line) => cleanContent(line, pos, metas)).filter((line) => !skipContent(doc, line, pos, metas));
  for (const line of content) { const result = draw(writer, line, x, y, width); y = result.next; broke ||= result.broke; }
  writer.y = broke ? y : Math.max(start + dateHeight, y);
}

export function renderExperience(writer: PdfWriter, doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;
  if (!items.length) return;
  writer.y += layout.experienceSectionTopGap;
  writer.sectionTitle(doc.snapshot.experienceTitle || "Опыт работы");
  items.forEach((item, index) => renderItem(writer, doc, item, index === 0));
}

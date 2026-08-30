import type { SourceResumeDocument } from "../../types.js";
import { normalizeLine, normalizeTextValue } from "./line-utils.js";

const MONTH =
  "январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря";
const DURATION =
  "\\d+\\s+(?:год|года|лет|месяц|месяца|месяцев)(?:\\s+\\d+\\s+(?:месяц|месяца|месяцев))?";
const DATE_VALUE = `(?:(?:${MONTH})\\s+)?\\d{4}|\\d{1,2}\\.\\d{1,2}\\.\\d{4}|\\d{4}`;
const DATE_START = new RegExp(
  `^(?:${DATE_VALUE})(?:\\s*(?:—|-|–)\\s*(?:(?:${DATE_VALUE})|[Нн]астоящее время))?(?:\\s+${DURATION})?$`,
  "iu",
);

export function isDurationLine(line: string) {
  return new RegExp(`^${DURATION}$`, "iu").test(normalizeLine(line));
}

export function isDateLine(line: string) {
  return new RegExp(`^(?:${DATE_VALUE}|[Нн]астоящее время)$`, "iu").test(normalizeLine(line));
}

export function isExperienceDateStart(line: string) {
  return DATE_START.test(normalizeLine(line));
}

function reconstructRange(current: string, next: string) {
  const range = normalizeLine(current).match(
    new RegExp(`^(${DATE_VALUE})\\s*(—|-|–)\\s*(${MONTH})(?:\\s+(.+))?$`, "iu"),
  );
  const nextMatch = normalizeLine(next).match(/^(\d{4})(?:\s+(.+))?$/u);
  if (!range || !nextMatch) return null;
  const trailing = normalizeLine([range[4], nextMatch[2]].filter(Boolean).join(" "));
  return {
    dateLine: normalizeLine(`${range[1]} ${range[2]} ${range[3]} ${nextMatch[1]}`),
    trailingLine: trailing || null,
  };
}

export function normalizeExperienceDateLines(lines: string[]) {
  const result: string[] = [];
  const cleanLines = lines.map(normalizeLine).filter(Boolean);
  for (let index = 0; index < cleanLines.length; index += 1) {
    const current = cleanLines[index];
    const next = cleanLines[index + 1];
    const afterNext = cleanLines[index + 2];
    const reconstructed = current && next ? reconstructRange(current, next) : null;
    if (reconstructed) {
      result.push(reconstructed.dateLine);
      if (reconstructed.trailingLine) result.push(reconstructed.trailingLine);
      index += 1;
    } else if (current && /[—–-]\s*$/u.test(current) && next && isDateLine(next)) {
      const range = normalizeLine(`${current} ${next}`);
      result.push(afterNext && isDurationLine(afterNext)
        ? normalizeLine(`${range} ${afterNext}`) : range);
      index += afterNext && isDurationLine(afterNext) ? 2 : 1;
    } else if (current && isDateLine(current) && next && isDurationLine(next)) {
      result.push(normalizeLine(`${current} ${next}`));
      index += 1;
    } else if (current) result.push(current);
  }
  return result;
}

export function parseDates(
  line: string,
): SourceResumeDocument["experience"]["items"][number]["dates"] {
  const normalized = normalizeLine(line);
  const match = normalized.match(
    new RegExp(`^(${DATE_VALUE})(?:\\s*(?:—|-|–)\\s*(${DATE_VALUE}|[Нн]астоящее время))?(?:\\s+(${DURATION}))?$`, "iu"),
  );
  if (!match) return { start: normalized || null, end: null, duration: null, raw: [line] };
  return {
    start: normalizeTextValue(match[1]),
    end: normalizeTextValue(match[2]),
    duration: normalizeTextValue(match[3]),
    raw: [line],
  };
}

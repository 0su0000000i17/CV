import type { SourceResumeDocument } from "../../types.js";
import { parseExperienceBlocks } from "./experience-blocks.js";
import { isDateLine, isDurationLine, parseDates } from "./experience-dates.js";
import {
  isCompanyMetaLine,
  isLikelyPositionLine,
  isPlaceholderLine,
  normalizeCompanyName,
} from "./experience-predicates.js";
import { isServiceLine, normalizeLine, normalizeTextValue, textKey } from "./line-utils.js";
import { hasUrl, parseCompanyCityUrl } from "./url-utils.js";

function normalizeCompanyMetaLines(lines: string[]) {
  const result: string[] = [];
  for (const value of lines) {
    const line = normalizeLine(value);
    if (!line || isServiceLine(line) || isPlaceholderLine(line)) continue;
    const previous = result.at(-1);
    if (previous?.startsWith("•") && /^[а-яё]/u.test(line) && !hasUrl(line)) {
      result[result.length - 1] = `${previous} ${line}`;
    } else result.push(line);
  }
  return result;
}

export function parseExperienceItem(
  lines: string[],
  index: number,
): SourceResumeDocument["experience"]["items"][number] {
  const raw = [...lines];
  let dates = parseDates(lines[0] ?? "");
  const remainingWithDuration = lines.slice(1).map(normalizeLine)
    .filter((line) => line && !isServiceLine(line));
  const likelyPositionIndex = remainingWithDuration.findIndex(isLikelyPositionLine);
  const durationIndex = remainingWithDuration.findIndex((line, lineIndex) =>
    isDurationLine(line) &&
    (likelyPositionIndex < 0 ? lineIndex <= 3 : lineIndex < likelyPositionIndex),
  );
  if (!dates.duration && durationIndex >= 0) {
    dates = { ...dates, duration: remainingWithDuration[durationIndex] ?? null };
  }
  const remaining = remainingWithDuration.filter((_line, i) => i !== durationIndex);
  const firstContentIndex = remaining.findIndex((line) =>
    !isDurationLine(line) && !isDateLine(line),
  );
  const companyName = normalizeCompanyName(
    firstContentIndex >= 0 ? remaining[firstContentIndex] : "",
  );
  const afterCompany = firstContentIndex < 0 ? [] : remaining.slice(firstContentIndex + 1);
  const positionIndex = afterCompany.findIndex(isLikelyPositionLine);
  const fallbackPosition = positionIndex >= 0
    ? positionIndex
    : afterCompany.findIndex((line) => !isCompanyMetaLine(line));
  const companyMeta = normalizeCompanyMetaLines(
    afterCompany.slice(0, fallbackPosition >= 0 ? fallbackPosition : afterCompany.length),
  );
  const position = fallbackPosition >= 0 ? normalizeTextValue(afterCompany[fallbackPosition]) : null;
  const blocks = parseExperienceBlocks(
    fallbackPosition >= 0 ? afterCompany.slice(fallbackPosition + 1) : [],
  );
  const meta = companyMeta.map((line) => {
    const value = line.replace(/^•\s*/u, "").trim();
    return line.startsWith("•") && value ? `• ${value}` : value;
  }).filter(Boolean);
  const cityUrl = companyMeta.map((line, i) => parseCompanyCityUrl(line, i === 0));
  const city = cityUrl.map((item) => item.city).find(Boolean) ?? null;
  return {
    id: `exp_${index + 1}`,
    sourceIndex: index,
    dates,
    company: {
      name: companyName,
      city,
      url: cityUrl.map((item) => item.url).find(Boolean) ?? null,
      industries: meta.filter((line) => !hasUrl(line) && (!city || textKey(line) !== textKey(city))),
      raw: companyMeta,
    },
    position,
    blocks,
    raw,
  };
}

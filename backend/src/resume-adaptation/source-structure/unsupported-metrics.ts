import {
  extractMetricTokens,
  METRIC_TOKEN_PATTERN,
} from "../../utils/metric-text.js";
import type { SupportContext } from "./types.js";

const CYRILLIC_WORD_CHAR = "а-яёА-ЯЁ0-9";
const NOT_PRECEDED = `(?<![${CYRILLIC_WORD_CHAR}])`;
const NOT_FOLLOWED = `(?![${CYRILLIC_WORD_CHAR}])`;

export function cleanupUnsupportedClaimText(value: string) {
  return value
    .replace(
      new RegExp(`${NOT_PRECEDED}с\\s+до\\s+\\d+(?:[.,]\\d+)?\\s*[xх]?\\.?`, "giu"),
      "",
    )
    .replace(
      new RegExp(`${NOT_PRECEDED}с\\s+\\d+(?:[.,]\\d+)?\\s*[xх]?\\s+до${NOT_FOLLOWED}(?!\\s*\\d)`, "giu"),
      "",
    )
    .replace(/\((?:\s*[,/;]?\s*)+\)/gu, "")
    .replace(/\(\s*\)/gu, "")
    .replace(/(?:,\s*){2,}/gu, ", ")
    .replace(/,\s*([).])/gu, "$1")
    .replace(/\s+,/gu, ",")
    .replace(/(?:включая|в том числе)\s*[,.]?\s*([.)])/giu, "$1")
    .replace(
      new RegExp(`${NOT_PRECEDED}(?:в|на|для|через|с помощью|с)\\s*[,.]`, "giu"),
      ".",
    )
    .replace(
      new RegExp(`${NOT_PRECEDED}(?:включая|в том числе)\\s*$`, "giu"),
      "",
    )
    .replace(
      new RegExp(`${NOT_PRECEDED}(?:в|на|для|через|с помощью|с|со)\\s*$`, "giu"),
      "",
    )
    .replace(/\s{2,}/gu, " ")
    .replace(/\s+\./gu, ".")
    .replace(/\.{2,}/gu, ".")
    .trim();
}

export function stripUnverifiedMetrics(value: string, context: SupportContext) {
  const pattern = new RegExp(METRIC_TOKEN_PATTERN.source, METRIC_TOKEN_PATTERN.flags);
  const rawMatches = value.match(pattern) || [];
  if (!rawMatches.length) return { text: value, strippedCount: 0 };
  const normalizedTokens = extractMetricTokens(value);
  let result = value;
  let strippedCount = 0;
  rawMatches.forEach((raw, index) => {
    const normalized = normalizedTokens[index];
    if (normalized && !context.sourceMetricTokens.has(normalized)) {
      result = result.replace(raw, "");
      strippedCount += 1;
    }
  });
  return strippedCount
    ? { text: cleanupUnsupportedClaimText(result), strippedCount }
    : { text: value, strippedCount: 0 };
}

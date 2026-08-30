import { normalizeText } from "./utils.js";

export function extractExperienceText(resumeMarkdown?: string) {
  const text = normalizeText(resumeMarkdown || "");
  if (!text) return "";

  const startMatch = text.search(
    /опыт\s+работы|work\s+experience|experience/iu
  );

  if (startMatch === -1) return text;

  const rest = text.slice(startMatch);
  const endMatch = rest.search(
    /\n\s*(?:образование|education|ключевые\s+навыки|навыки|skills|обо\s+мне|about|дополнительн|сертификат|курсы)\b/iu
  );

  return endMatch === -1 ? rest : rest.slice(0, endMatch);
}

export function parseDeclaredExperienceMonths(text: string) {
  const match = text.match(
    /(?:опыт\s+работы|experience)\s*[—:\-–]?\s*(?:(\d+)\s*(?:год(?:а|ов)?|лет|years?))?\s*(?:(\d+)\s*(?:месяц(?:а|ев)?|months?))?/iu
  );

  if (!match) return null;

  const years = Number(match[1] || 0);
  const months = Number(match[2] || 0);
  const total = years * 12 + months;

  return total > 0 ? total : null;
}

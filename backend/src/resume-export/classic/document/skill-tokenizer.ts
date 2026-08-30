import { cleanText } from "../text.js";

const SUFFIXES = new Set([
  "API", "Framework", "Query", "Router", "Testing", "Test", "Thunk",
]);
const PREFIXES = new Set(["Apache", "MS", "RTK"]);

function isUpper(value: string) {
  return /^[A-Z0-9+#./-]{2,}$/u.test(value);
}

function isTitle(value: string) {
  return /^[A-Z][A-Za-z0-9+#./-]*$/u.test(value) && /[a-z]/u.test(value);
}

function isVersion(value: string) {
  return /^\d+(?:\.\d+)?$/u.test(value);
}

function shouldJoin(current: string, next: string) {
  if (isVersion(next) && (isUpper(current) || isTitle(current))) return true;
  if (next === "API") {
    return /^(?:REST|RESTful|SOAP|GraphQL|gRPC|OpenAPI|HTTP|JSON|XML)$/iu.test(current);
  }
  if (PREFIXES.has(current) && (isUpper(next) || isTitle(next))) return true;
  if (SUFFIXES.has(next) && (isUpper(current) || isTitle(current))) return true;
  return isTitle(current) && /^[a-z][a-z0-9+#./-]*$/u.test(next);
}

export function splitPackedSkillLine(value: string) {
  const text = cleanText(value);
  const tokens = text.split(/\s+/u).filter(Boolean);
  const packed = tokens.length >= 4 && tokens.some((token) => /[A-Za-z0-9+#.]/u.test(token));
  const versionedTail = tokens.some((token, index) => {
    const next = tokens[index + 1];
    return Boolean(next && tokens[index + 2] && isVersion(next) && (isUpper(token) || isTitle(token)));
  });
  if (!packed && !versionedTail) return [text].filter(Boolean);
  const result: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    const next = tokens[index + 1];
    if (next && shouldJoin(current, next)) {
      result.push(`${current} ${next}`);
      index += 1;
    } else result.push(current);
  }
  return result;
}

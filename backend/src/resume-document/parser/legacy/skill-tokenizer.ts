import { normalizeLine } from "./line-utils.js";

const COMPOUND_SUFFIXES = new Set([
  "API", "Framework", "Query", "Router", "Testing", "Test", "Thunk",
]);
const COMPOUND_PREFIXES = new Set(["Apache", "MS", "RTK"]);

function isUpperToken(value: string) {
  return /^[A-Z0-9+#./-]{2,}$/u.test(value);
}

function isTitleToken(value: string) {
  return /^[A-Z][A-Za-z0-9+#./-]*$/u.test(value) && /[a-z]/u.test(value);
}

function isLowerDescriptor(value: string) {
  return /^[a-z][a-z0-9+#./-]*$/u.test(value);
}

function isVersion(value: string) {
  return /^\d+(?:\.\d+)?$/u.test(value);
}

function shouldJoin(current: string, next: string) {
  if (isVersion(next) && (isUpperToken(current) || isTitleToken(current))) return true;
  if (next === "API") return /^(?:REST|RESTful|SOAP|GraphQL|gRPC|OpenAPI|HTTP|JSON|XML)$/iu.test(current);
  if (COMPOUND_PREFIXES.has(current) && (isUpperToken(next) || isTitleToken(next))) return true;
  if (COMPOUND_SUFFIXES.has(next) && (isUpperToken(current) || isTitleToken(current))) return true;
  return isTitleToken(current) && isLowerDescriptor(next);
}

export function splitPackedSkillLine(value: string) {
  const result: string[] = [];
  const segments = value.split(/[|,;•]+/gu).map(normalizeLine).filter(Boolean);
  for (const segment of segments) {
    const words = segment.split(/\s+/u).filter(Boolean);
    for (let index = 0; index < words.length; index += 1) {
      const current = words[index];
      const next = words[index + 1];
      if (next && shouldJoin(current, next)) {
        result.push(`${current} ${next}`);
        index += 1;
      } else result.push(current);
    }
  }
  return result.map(normalizeLine).filter((item) => item.length > 1);
}

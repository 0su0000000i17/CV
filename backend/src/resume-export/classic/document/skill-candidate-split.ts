import { cleanText } from "../text.js";
import {
  isValidSkillValue,
  splitExplicitSkillValue,
} from "./skill-classification.js";
import { splitPackedSkillLine } from "./skill-tokenizer.js";

function hasBoundary(text: string, index: number, length: number) {
  const before = index > 0 ? text[index - 1] : "";
  const after = text[index + length] || "";
  return (!before || /\s/u.test(before)) && (!after || /\s/u.test(after));
}

function matchAtStart(value: string, candidates: string[]) {
  const lower = value.toLowerCase();
  return candidates.find((candidate) =>
    lower.startsWith(candidate.toLowerCase()) && hasBoundary(value, 0, candidate.length),
  );
}

function findNext(value: string, candidates: string[]) {
  const lower = value.toLowerCase();
  let best: { index: number; candidate: string } | null = null;
  for (const candidate of candidates) {
    const target = candidate.toLowerCase();
    let index = lower.indexOf(target, 1);
    while (index >= 0) {
      if (hasBoundary(value, index, candidate.length)) {
        if (!best || index < best.index ||
          (index === best.index && candidate.length > best.candidate.length)) {
          best = { index, candidate };
        }
        break;
      }
      index = lower.indexOf(target, index + 1);
    }
  }
  return best;
}

function splitByKnownCandidates(value: string, candidates: string[]) {
  const text = cleanText(value);
  if (!text || !candidates.length) return [text].filter(Boolean);
  const ordered = [...candidates].map(cleanText).filter(Boolean)
    .sort((first, second) => second.length - first.length);
  const result: string[] = [];
  let rest = text;
  while (rest) {
    rest = rest.trimStart();
    const matched = matchAtStart(rest, ordered);
    if (matched) {
      result.push(matched);
      rest = rest.slice(matched.length);
      continue;
    }
    const next = findNext(rest, ordered);
    if (next && next.index > 0) {
      result.push(rest.slice(0, next.index));
      rest = rest.slice(next.index);
    } else {
      result.push(rest);
      break;
    }
  }
  const cleaned = result.map(cleanText).filter(Boolean);
  return cleaned.length > 1 ? cleaned : [text];
}

export function splitSkillValue(value: string, candidates: string[]): string[] {
  const explicit = splitExplicitSkillValue(value);
  if (explicit.length > 1) return explicit.flatMap((item) => splitSkillValue(item, candidates));
  const text = explicit[0] || cleanText(value);
  if (!isValidSkillValue(text)) return [];
  const known = splitByKnownCandidates(text, candidates);
  if (known.length > 1) return known.flatMap((item) => splitSkillValue(item, []));
  return splitPackedSkillLine(text).filter(isValidSkillValue);
}

import type { ParsedConfirmedFact } from "../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";
import { getConfirmedFactMatch } from "./fact-match.js";
import { tokenOverlap } from "./semantic-matching.js";
import type {
  ConfirmedFactIntegrationIssue,
  FactMatch,
  SourceExperienceItem,
} from "./types.js";

export function collectFactMatches(params: {
  facts: ParsedConfirmedFact[];
  sourceByIndex: Map<number, SourceExperienceItem>;
  adaptedByIndex: Map<
    number,
    ResumeAdaptationResult["adaptedResume"]["experience"][number]
  >;
}) {
  const matches: FactMatch[] = [];
  const issues: ConfirmedFactIntegrationIssue[] = [];
  const seen = new Set<string>();
  for (const fact of params.facts) {
    const candidates = fact.sourceIndex !== null
      ? [params.adaptedByIndex.get(fact.sourceIndex)].filter(Boolean)
      : [...params.adaptedByIndex.values()];
    for (const item of candidates) {
      if (!item) continue;
      const bulletMatches = (item.adaptedBullets || [])
        .map((bullet) => ({ bullet, match: getConfirmedFactMatch(fact, bullet) }))
        .filter((candidate) => candidate.match.matches);
      const source = params.sourceByIndex.get(item.sourceIndex);
      for (const { bullet, match } of bulletMatches) {
        matches.push({
          fact,
          sourceIndex: item.sourceIndex,
          company: item.company || source?.company || null,
          bullet,
          answerEvidence: match.answerEvidence,
        });
        const closestSource = (source?.bullets || [])
          .map((sourceBullet) => ({
            overlap: tokenOverlap(sourceBullet, bullet),
            relation: tokenOverlap(sourceBullet, `${fact.question} ${fact.answer}`),
          }))
          .sort((left, right) => right.overlap - left.overlap)[0];
        if (
          match.answerEvidence &&
          closestSource &&
          closestSource.overlap >= 0.5 &&
          closestSource.relation < 0.16
        ) {
          const key = `unrelated:${item.sourceIndex}:${bullet}`;
          if (!seen.has(key)) {
            seen.add(key);
            issues.push({
              type: "unrelated_merge",
              sourceIndex: item.sourceIndex,
              company: item.company || source?.company || null,
              bullet,
              facts: [fact.raw],
              reason: "Подтверждённый факт присоединён к исходному bullet о другом действии",
            });
          }
        }
      }
    }
  }
  return { matches, issues, seen };
}

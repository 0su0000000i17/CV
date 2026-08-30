import { tokenOverlap } from "./semantic-matching.js";
import type { ConfirmedFactIntegrationIssue, FactMatch } from "./types.js";

export function appendMultipleFactIssues(params: {
  matches: FactMatch[];
  issues: ConfirmedFactIntegrationIssue[];
  seen: Set<string>;
}) {
  const matchesByBullet = new Map<string, FactMatch[]>();
  for (const match of params.matches) {
    const key = `${match.sourceIndex}:${match.bullet}`;
    matchesByBullet.set(key, [...(matchesByBullet.get(key) || []), match]);
  }
  for (const bulletMatches of matchesByBullet.values()) {
    const uniqueQuestions = new Map<string, FactMatch>();
    for (const match of bulletMatches.filter((candidate) => candidate.answerEvidence)) {
      uniqueQuestions.set(match.fact.questionId || match.fact.raw, match);
    }
    const values = [...uniqueQuestions.values()];
    if (values.length < 2) continue;
    const hasUnrelatedPair = values.some((left, index) =>
      values.slice(index + 1).some(
        (right) => tokenOverlap(left.fact.answer, right.fact.answer) < 0.16
      )
    );
    if (!hasUnrelatedPair) continue;
    const first = values[0]!;
    const key = `multiple:${first.sourceIndex}:${first.bullet}`;
    if (params.seen.has(key)) continue;
    params.seen.add(key);
    params.issues.push({
      type: "multiple_unrelated_facts",
      sourceIndex: first.sourceIndex,
      company: first.company,
      bullet: first.bullet,
      facts: values.map((value) => value.fact.raw),
      reason: "В один bullet объединены разные действия из разных вопросов",
    });
  }
}

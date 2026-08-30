import type { VacancyCriterion } from "./types.js";

const SOURCE_PRIORITY: Record<VacancyCriterion["source"], number> = {
  requirement: 3,
  skill: 2,
  nice_to_have: 1,
};

const KIND_PRIORITY: Record<VacancyCriterion["kind"], number> = {
  skill: 4,
  education: 4,
  language: 4,
  domain: 3,
  seniority: 2,
  experience: 1,
};

function mergeRelatedCriteria(left: VacancyCriterion, right: VacancyCriterion) {
  const wording = SOURCE_PRIORITY[right.source] > SOURCE_PRIORITY[left.source] ? right : left;
  const typing = KIND_PRIORITY[right.kind] > KIND_PRIORITY[left.kind] ? right : left;
  return {
    ...wording,
    kind: typing.kind,
    evidence: typing.evidence,
    priority: left.priority === "required" || right.priority === "required"
      ? "required" as const : "preferred" as const,
  };
}

export function mergeCandidateCriteria(
  candidates: VacancyCriterion[],
  keyFor: (criterion: VacancyCriterion) => string,
) {
  const merged = new Map<string, VacancyCriterion>();
  for (const item of candidates) {
    const key = keyFor(item);
    if (!key) continue;
    const current = merged.get(key);
    merged.set(key, current ? mergeRelatedCriteria(current, item) : item);
  }
  return [...merged.values()];
}

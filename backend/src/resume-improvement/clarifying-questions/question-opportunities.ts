import type { ResumeAnalysisSignals } from "./types.js";
import { normalizeQuestionText } from "./question-topic.js";
import type { ResumeQuestionContext } from "./resume-question-context.js";

export type EvidenceOpportunity = {
  sourceIndex: number;
  claimIndex: number;
  company: string | null;
  position: string | null;
  claim: string | null;
  topic: "achievement" | "metrics";
  score: number;
};

const METRIC_PATTERN = /(?:\d|%|процент|\bраз(?:а|ы)?\b|rps|sla|uptime|млн|тыс|секунд|минут|час)/iu;
const OUTCOME_PATTERN = /(?:сократ|сниз|увелич|повыс|ускор|улучш|обеспеч|достиг|стабилиз|устран|запуст|внедр|результ|рост|эконом|что позвол)/iu;
const METRIC_SIGNAL = /(?:missing_metrics|метрик|цифр|измерим|показател)/iu;
const EVIDENCE_SIGNAL = /(?:weak_evidence|generic_responsibilities|обязанност|шаблон|конкретик|доказатель|результат)/iu;

function signalText(signals?: ResumeAnalysisSignals) {
  return [
    ...(signals?.weaknesses || []), ...(signals?.recommendations || []),
    ...(signals?.redFlags || []).flatMap((flag) => [flag.type, flag.explanation]),
  ].join(" ");
}

function scoreClaim(claim: string, duplicate: boolean, signals: string, recent: boolean) {
  const hasMetric = METRIC_PATTERN.test(claim);
  const hasOutcome = OUTCOME_PATTERN.test(claim);
  let score = duplicate ? 5 : 0;
  if (!hasOutcome) score += 3;
  if (!hasMetric) score += METRIC_SIGNAL.test(signals) ? 2 : 1;
  if (claim.split(/\s+/u).length < 9) score += 1;
  if (recent) score += 1;
  if (EVIDENCE_SIGNAL.test(signals) && !hasOutcome) score += 1;
  return { score, topic: hasOutcome && !hasMetric ? "metrics" as const : "achievement" as const };
}

export function selectEvidenceOpportunities(
  context: ResumeQuestionContext,
  signals: ResumeAnalysisSignals | undefined,
  limit: number,
) {
  const counts = new Map<string, number>();
  for (const experience of context.experiences) {
    for (const claim of new Set(experience.claims.map(normalizeQuestionText))) {
      if (claim) counts.set(claim, (counts.get(claim) || 0) + 1);
    }
  }
  const signalsText = signalText(signals);
  const candidates: EvidenceOpportunity[] = [];
  context.experiences.forEach((experience, experienceIndex) => {
    if (!experience.claims.length) {
      candidates.push({
        sourceIndex: experience.sourceIndex, company: experience.company,
        position: experience.position, claimIndex: 0, claim: null,
        topic: "achievement", score: 10,
      });
      return;
    }
    experience.claims.forEach((claim, claimIndex) => {
      const quality = scoreClaim(
        claim,
        (counts.get(normalizeQuestionText(claim)) || 0) > 1,
        signalsText,
        experienceIndex === 0,
      );
      if (quality.score >= 4) candidates.push({
        sourceIndex: experience.sourceIndex, company: experience.company,
        position: experience.position, claimIndex, claim, ...quality,
      });
    });
  });
  candidates.sort((left, right) =>
    right.score - left.score || left.sourceIndex - right.sourceIndex);
  const perExperience = new Map<number, number>();
  return candidates.filter((item) => {
    const count = perExperience.get(item.sourceIndex) || 0;
    if (count >= 2) return false;
    perExperience.set(item.sourceIndex, count + 1);
    return true;
  }).slice(0, Math.max(0, limit));
}

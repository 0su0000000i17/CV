import type { ParsedConfirmedFact } from "../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import { extractMetricTokens } from "../../utils/metric-text.js";
import { semanticTokens, tokenOverlap } from "./semantic-matching.js";

export function getConfirmedFactMatch(
  fact: ParsedConfirmedFact,
  bullet: string
) {
  const answerTokens = semanticTokens(fact.answer);
  const factText = `${fact.question} ${fact.answer}`;
  const factTokens = semanticTokens(factText);
  const answerCoverage = tokenOverlap(fact.answer, bullet);
  const factCoverage = tokenOverlap(factText, bullet);
  const metrics = extractMetricTokens(fact.answer);
  const bulletMetrics = new Set(extractMetricTokens(bullet));
  const metricMatch =
    metrics.length > 0 && metrics.every((metric) => bulletMetrics.has(metric));
  const answerEvidence =
    metricMatch || (answerTokens.length >= 3 && answerCoverage >= 0.45);
  return {
    matches: answerEvidence || (factTokens.length >= 5 && factCoverage >= 0.32),
    answerEvidence,
  };
}

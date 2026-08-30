import type {
  ClarifyingQuestion,
  ClarifyingQuestionTopic,
} from "./types.js";

const SOFT_TOPICS = new Set<ClarifyingQuestionTopic>([
  "soft_skill", "collaboration", "leadership",
]);
const HARD_TOPICS = new Set<ClarifyingQuestionTopic>([
  "achievement", "metrics", "hard_skill",
]);

export function normalizeQuestionText(value: string) {
  return value.toLowerCase().replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

export function inferQuestionTopic(
  question: ClarifyingQuestion
): ClarifyingQuestionTopic {
  if (question.topic) return question.topic;
  const area = normalizeQuestionText(question.targetArea || "");
  const text = normalizeQuestionText(question.question);
  if (area.includes("position") || area.includes("career")) return "positioning";
  if (area.includes("metric") || area.includes("scope")) return "metrics";
  if (area.includes("tool") || area.includes("skill")) return "hard_skill";
  if (area.includes("leader") || text.includes("руковод") || text.includes("ментор")) {
    return "leadership";
  }
  if (
    area.includes("collabor") || text.includes("команд") ||
    text.includes("заказчик") || text.includes("стейкхолдер") ||
    text.includes("конфликт")
  ) return "collaboration";
  if (area.includes("soft")) return "soft_skill";
  if (area.includes("develop") || text.includes("обучен") || text.includes("курс")) {
    return "development";
  }
  return "achievement";
}

export function isSoftQuestionTopic(topic: ClarifyingQuestionTopic) {
  return SOFT_TOPICS.has(topic);
}

export function isHardQuestionTopic(topic: ClarifyingQuestionTopic) {
  return HARD_TOPICS.has(topic);
}

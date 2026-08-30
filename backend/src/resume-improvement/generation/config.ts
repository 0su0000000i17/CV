import { ADAPT_MAX_TOKENS } from "../../resume-adaptation/adaptation-generation/config.js";

export function improvementModelOverride() {
  return process.env.YANDEX_AI_MODEL_PRO?.trim()
    || process.env.YANDEX_AI_ADAPTATION_MODEL?.trim()
    || undefined;
}

export function improvementMaxTokens() {
  const value = Number(process.env.AI_IMPROVE_MAX_TOKENS);
  return Number.isFinite(value) && value > 0 ? value : Math.max(ADAPT_MAX_TOKENS, 4_200);
}

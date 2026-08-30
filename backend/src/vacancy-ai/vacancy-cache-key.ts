import { createSha256Hash } from "../resume-analysis/hashing.js";
import { expectedYandexProviderName } from "../ai/providers/yandex/model.js";

type StableValue = string | number | boolean | null | StableValue[] |
  { [key: string]: StableValue | undefined };

function stableNormalize(value: unknown): StableValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.replace(/\s+/gu, " ").trim();
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(stableNormalize);
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).sort()
      .reduce<Record<string, StableValue>>((result, key) => {
        result[key] = stableNormalize((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return String(value);
}

export function stableVacancyHash(value: unknown) {
  return createSha256Hash(JSON.stringify(stableNormalize(value)));
}

export function expectedVacancyModel(maxTokens: number) {
  const lite = process.env.YANDEX_AI_MODEL_LITE?.trim() ||
    process.env.YANDEX_AI_MODEL?.trim() || "unknown";
  const pro = process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() || lite;
  return maxTokens >= 3_000 ? pro : lite;
}

export function expectedVacancyProvider() {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || "unknown";
  return ["yandex", "yandex-ai", "yandex-ai-studio"].includes(provider)
    ? expectedYandexProviderName()
    : provider;
}

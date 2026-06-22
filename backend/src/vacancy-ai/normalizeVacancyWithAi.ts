import { normalizeVacancyWithGigaChat } from "./gigachatVacancyNormalizer.js";
import type {
  VacancyNormalizationResult,
  VacancySourceMetadata,
} from "./types.js";

export async function normalizeVacancyWithAi(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): Promise<VacancyNormalizationResult> {
  const provider = process.env.AI_PROVIDER || "gigachat";

  if (provider !== "gigachat") {
    return {
      ok: false,
      message: `AI provider "${provider}" is not supported for vacancy normalization yet.`,
    };
  }

  return normalizeVacancyWithGigaChat(params);
}
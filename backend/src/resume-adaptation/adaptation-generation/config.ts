const DEFAULT_ADAPT_MAX_TOKENS = 7_000;
const MIN_ADAPT_MAX_TOKENS = 7_000;

function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const ADAPT_MAX_TOKENS = Math.max(
  getNumberEnv("AI_ADAPT_MAX_TOKENS", DEFAULT_ADAPT_MAX_TOKENS),
  MIN_ADAPT_MAX_TOKENS
);
export const ADAPT_RESUME_MAX_CHARS = getNumberEnv(
  "AI_ADAPT_RESUME_MAX_CHARS",
  32_000
);
export const ADAPT_VACANCY_MAX_CHARS = getNumberEnv(
  "AI_ADAPT_VACANCY_MAX_CHARS",
  16_000
);

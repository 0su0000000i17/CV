import { supabaseAdmin } from "../../lib/supabase.js";
import { parseExperienceCompanies } from "../../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import { resolveAdaptationConfirmedFacts } from "../../resume-adaptation/adaptation-questions/resolve-adaptation-facts.js";
import { resolveConfirmedRequirements } from "../../resume-adaptation/adaptation-questions/resolve-confirmed-requirements.js";
import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { createVacancyHash } from "./vacancy-context.js";

export type AdaptationConfirmedContext = {
  confirmedFacts?: string[];
  confirmedRequirements?: string[];
};

export async function resolveAdaptationConfirmedContext(params: {
  userId: string;
  resumeId: string;
  sessionId?: unknown;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  resumeJson: string;
}): Promise<AdaptationConfirmedContext> {
  const sessionId = typeof params.sessionId === "string" ? params.sessionId.trim() : "";
  if (!sessionId) return {};
  const { data, error } = await supabaseAdmin
    .from("resume_adaptation_sessions")
    .select("questions, answers, skipped, vacancy_hash")
    .eq("id", sessionId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error || !data || data.skipped) return {};
  if (data.vacancy_hash !== createVacancyHash(params.vacancy, params.vacancyText)) {
    return {};
  }

  const questions = (data.questions || []) as ClarifyingQuestion[];
  const answers = data.answers as ClarifyingAnswer[] | null;
  const facts = resolveAdaptationConfirmedFacts({
    questions,
    answers,
    companies: parseExperienceCompanies(params.resumeJson),
  });
  const requirements = resolveConfirmedRequirements({ questions, answers });
  return {
    confirmedFacts: facts.length ? facts : undefined,
    confirmedRequirements: requirements.length ? requirements : undefined,
  };
}

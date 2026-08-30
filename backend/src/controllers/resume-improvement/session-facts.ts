import { z } from "zod";

import { supabaseAdmin } from "../../lib/supabase.js";
import { resolveConfirmedFacts } from "../../resume-improvement/clarifying-questions/resolve-answers.js";
import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";

export const improvementRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
}).strict();

export async function resolveSessionFacts(params: {
  userId: string;
  resumeId: string;
  sessionId?: string;
}) {
  if (!params.sessionId) return undefined;
  const { data, error } = await supabaseAdmin.from("resume_improvement_sessions")
    .select("questions, answers, skipped")
    .eq("id", params.sessionId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error || !data || data.skipped) return undefined;
  return resolveConfirmedFacts({
    questions: (data.questions || []) as ClarifyingQuestion[],
    answers: data.answers as ClarifyingAnswer[] | null,
  });
}

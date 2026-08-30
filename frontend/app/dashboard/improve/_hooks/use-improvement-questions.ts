'use client';

import { useState } from 'react';

import type { ClarifyingAnswer, ImprovementQuestionsSession } from '@/src/shared/api/resume-improvement-questions';
import { useImprovementQuestionsMutation } from '@/src/shared/hooks/use-improvement-questions-mutation';
import { useSubmitImprovementAnswersMutation } from '@/src/shared/hooks/use-submit-improvement-answers-mutation';

export function useImprovementQuestions(params: {
  accessToken: string | null | undefined;
  resumeId?: string;
  onRun: (sessionId?: string) => void;
}) {
  const questions = useImprovementQuestionsMutation();
  const submit = useSubmitImprovementAnswersMutation();
  const [session, setSession] = useState<ImprovementQuestionsSession | null>(null);
  const activeSession = session?.resume_id === params.resumeId ? session : null;

  function start() {
    if (!params.accessToken || !params.resumeId || questions.isPending) return;
    questions.mutate(
      { resumeId: params.resumeId, accessToken: params.accessToken },
      { onSuccess: (data) => {
        setSession(data.session);
        if (!data.session) params.onRun();
      } },
    );
  }

  function send(payload: { answers?: ClarifyingAnswer[]; skipped?: boolean }) {
    if (!params.accessToken || !params.resumeId || !activeSession) return;
    submit.mutate({
      resumeId: params.resumeId,
      sessionId: activeSession.id,
      accessToken: params.accessToken,
      ...payload,
    }, { onSuccess: () => params.onRun(activeSession.id) });
  }

  function reset() {
    setSession(null);
    questions.reset();
    submit.reset();
  }

  return {
    questions,
    submit,
    activeSession,
    start,
    submitAnswers: (answers: ClarifyingAnswer[]) => send({ answers }),
    skip: () => send({ skipped: true }),
    reset,
  };
}

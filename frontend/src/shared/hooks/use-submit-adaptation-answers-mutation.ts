import { useMutation } from '@tanstack/react-query';

import { submitAdaptationAnswers } from '@/src/shared/api/resume-adaptation-questions';
import type { ClarifyingAnswer } from '@/src/shared/api/resume-improvement-questions';

type Variables = {
  resumeId: string;
  sessionId: string;
  accessToken: string;
  answers?: ClarifyingAnswer[];
  skipped?: boolean;
};

export function useSubmitAdaptationAnswersMutation() {
  return useMutation({
    mutationFn: (variables: Variables) => submitAdaptationAnswers(variables),
  });
}

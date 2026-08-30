import { useMutation } from '@tanstack/react-query';

import type { ClarifyingAnswer } from '@/src/shared/api/resume-improvement-questions';
import { submitImprovementAnswers } from '@/src/shared/api/resume-improvement-questions';

type Variables = {
  resumeId: string;
  sessionId: string;
  accessToken: string;
  answers?: ClarifyingAnswer[];
  skipped?: boolean;
};

export function useSubmitImprovementAnswersMutation() {
  return useMutation({
    mutationFn: (variables: Variables) => submitImprovementAnswers(variables),
  });
}

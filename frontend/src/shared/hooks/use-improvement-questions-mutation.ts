import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  generateImprovementQuestions,
} from '@/src/shared/api/resume-improvement-questions';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';

type Variables = {
  resumeId: string;
  accessToken: string;
};

export function useImprovementQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: Variables) => generateImprovementQuestions(variables),
    onSuccess: (data) => applyTokenBalanceUpdate(queryClient, data.balance),
  });
}

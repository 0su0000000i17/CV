import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  improveResume,
  type ResumeAdaptationResponse,
} from '@/src/shared/api/resume-improvement';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';

type ResumeImprovementVariables = {
  resumeId: string;
  accessToken: string;
  sessionId?: string;
};

export function useResumeImprovementMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeAdaptationResponse,
    Error,
    ResumeImprovementVariables
  >({
    mutationFn: (variables) =>
      improveResume({
        ...variables,
        onQueued: (balance) => applyTokenBalanceUpdate(queryClient, balance),
      }),
  });
}

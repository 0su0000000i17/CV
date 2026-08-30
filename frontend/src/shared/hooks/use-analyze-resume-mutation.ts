import { useMutation, useQueryClient } from '@tanstack/react-query';

import { analyzeResume } from '@/src/shared/api/analyze';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';

type AnalyzeResumeVariables = {
  resumeId: string;
  accessToken: string;
};

export function useAnalyzeResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, accessToken }: AnalyzeResumeVariables) =>
      analyzeResume(resumeId, accessToken, (balance) =>
        applyTokenBalanceUpdate(queryClient, balance)
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(['resume-analysis', data.resumeId], data);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

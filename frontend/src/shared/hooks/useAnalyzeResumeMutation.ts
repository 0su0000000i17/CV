import { useMutation } from '@tanstack/react-query';

import { analyzeResume } from '@/src/shared/api/analyze';

type AnalyzeResumeVariables = {
  resumeId: string;
  accessToken: string;
};

export function useAnalyzeResumeMutation() {
  return useMutation({
    mutationFn: ({ resumeId, accessToken }: AnalyzeResumeVariables) =>
      analyzeResume(resumeId, accessToken),
  });
}
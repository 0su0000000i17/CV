import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import { updateResumeText } from '@/src/shared/api/resumes';

type UpdateResumeTextVariables = {
  resumeId: string;
  markdown: string;
  resumeJson: ResumeAdaptationResult | null;
  accessToken: string;
};

export function useUpdateResumeTextMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateResumeTextVariables) =>
      updateResumeText(variables),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['resume', variables.resumeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['resume-text', variables.resumeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['resumes'],
      });
    },
  });
}
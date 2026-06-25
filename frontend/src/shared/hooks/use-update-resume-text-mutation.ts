import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateResumeText } from '@/src/shared/api/resumes';

type UpdateResumeTextVariables = {
  resumeId: string;
  markdown: string;
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
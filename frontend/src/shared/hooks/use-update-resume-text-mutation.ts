import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import {
  updateResumeText,
  type ResumeTextResponse,
} from '@/src/shared/api/resumes';

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
      queryClient.setQueryData<ResumeTextResponse>(
        ['resume-text', variables.resumeId],
        (current) => ({
          status: 'ok',
          resumeId: variables.resumeId,
          source: 'saved_json',
          markdown: variables.markdown,
          resumeJson: variables.resumeJson,
          contacts: current?.contacts ?? null,
          stats: current?.stats ?? null,
          extractor: {
            mode: 'saved_json',
            provider: null,
            model: null,
          },
        })
      );

      queryClient.invalidateQueries({
        queryKey: ['resume', variables.resumeId],
      });

      queryClient.invalidateQueries({
        queryKey: ['resumes'],
      });
    },
  });
}
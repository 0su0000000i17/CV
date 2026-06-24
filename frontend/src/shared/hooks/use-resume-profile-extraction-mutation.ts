import { useMutation } from '@tanstack/react-query';

import {
  extractResumeProfile,
  type ResumeProfileExtractionResponse,
} from '@/src/shared/api/resumes';

type ResumeProfileExtractionVariables = {
  resumeId: string;
  accessToken: string;
};

export function useResumeProfileExtractionMutation() {
  return useMutation<
    ResumeProfileExtractionResponse,
    Error,
    ResumeProfileExtractionVariables
  >({
    mutationFn: ({ resumeId, accessToken }) => {
      return extractResumeProfile(resumeId, accessToken);
    },
  });
}   
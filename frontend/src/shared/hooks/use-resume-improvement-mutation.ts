import { useMutation } from '@tanstack/react-query';

import {
  improveResume,
  type ResumeAdaptationResponse,
} from '@/src/shared/api/resume-improvement';

type ResumeImprovementVariables = {
  resumeId: string;
  accessToken: string;
};

export function useResumeImprovementMutation() {
  return useMutation<
    ResumeAdaptationResponse,
    Error,
    ResumeImprovementVariables
  >({
    mutationFn: improveResume,
  });
}

import { useMutation } from '@tanstack/react-query';

import {
  generateCoverLetter,
  type CoverLetterResponse,
  type GenerateCoverLetterParams,
} from '@/src/shared/api/cover-letters';

export function useCoverLetterMutation() {
  return useMutation<CoverLetterResponse, Error, GenerateCoverLetterParams>({
    mutationFn: generateCoverLetter,
  });
}
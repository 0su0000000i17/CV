import { AdaptationResultCard } from './adaptation-result-card';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  isAdapting: boolean;
  isError: boolean;
  error: unknown;
  onResetAdaptation: () => void;
};

export function GeneratedResumeWorkspace({
  adaptationResponse,
  isAdapting,
  isError,
  error,
  onResetAdaptation,
}: Props) {
  return (
    <AdaptationResultCard
      adaptationResponse={adaptationResponse}
      isAdapting={isAdapting}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      onResetAdaptation={onResetAdaptation}
    />
  );
}

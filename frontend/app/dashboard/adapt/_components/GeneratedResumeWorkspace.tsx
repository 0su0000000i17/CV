import { AdaptationResultCard } from './AdaptationResultCard';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resumeAdaptation';

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
